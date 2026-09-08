from decimal import Decimal
from uuid import uuid4

import razorpay

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Sum

from io import BytesIO

from django.core.mail import EmailMessage
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Address
from cart.models import Cart
from coupons.models import Coupon, CouponUsage

from .models import Order, OrderItem
from .serializers import OrderSerializer


# ==========================================================
# RAZORPAY CLIENT
# ==========================================================

def get_razorpay_client():
    return razorpay.Client(
        auth=(
            settings.RAZORPAY_KEY_ID,
            settings.RAZORPAY_KEY_SECRET,
        )
    )


# ==========================================================
# HELPER - GENERATE ORDER NUMBER
# ==========================================================

def generate_order_number():
    return (
        f"ZIV-"
        f"{timezone.now().strftime('%Y%m%d')}-"
        f"{uuid4().hex[:8].upper()}"
    )


# ==========================================================
# HELPER - CALCULATE COUPON DISCOUNT
# ==========================================================

def calculate_coupon_discount(
    coupon,
    user,
    subtotal,
):
    if not coupon:
        return Decimal("0.00")

    now = timezone.now()

    if not coupon.is_active:
        raise ValueError(
            "Coupon is invalid or inactive."
        )

    if coupon.valid_from > now:
        raise ValueError(
            "This coupon is not active yet."
        )

    if coupon.valid_until < now:
        raise ValueError(
            "This coupon has expired."
        )

    if subtotal < coupon.min_order_amount:
        raise ValueError(
            f"Minimum order amount for this coupon "
            f"is ₹{coupon.min_order_amount}."
        )

    if (
        coupon.usage_limit is not None
        and coupon.used_count >= coupon.usage_limit
    ):
        raise ValueError(
            "This coupon usage limit has been reached."
        )

    user_usage_count = CouponUsage.objects.filter(
        coupon=coupon,
        user=user,
    ).count()

    if (
        coupon.usage_limit_per_user is not None
        and user_usage_count >= coupon.usage_limit_per_user
    ):
        raise ValueError(
            "You have already used this coupon "
            "the maximum allowed number of times."
        )

    discount = Decimal("0.00")

    if coupon.discount_type == "PERCENTAGE":

        discount = (
            subtotal
            * coupon.discount_value
            / Decimal("100")
        )

        if (
            coupon.max_discount_amount is not None
            and coupon.max_discount_amount > 0
        ):
            discount = min(
                discount,
                coupon.max_discount_amount,
            )

    elif coupon.discount_type == "FIXED":

        discount = coupon.discount_value

    discount = min(
        discount,
        subtotal,
    )

    return discount.quantize(
        Decimal("0.01")
    )


# ==========================================================
# HELPER - CREATE ORDER ITEMS + RESERVE STOCK
# ==========================================================

def create_order_items_and_reserve_stock(
    order,
    cart_items,
):
    """
    Creates snapshot OrderItems and reserves/decrements stock.
    """

    for cart_item in cart_items:

        product = cart_item.product
        variant = cart_item.variant

        unit_price = product.final_price

        OrderItem.objects.create(
            order=order,

            product=product,
            variant=variant,

            product_name=product.name,

            brand_name=(
                product.brand.name
                if product.brand
                else ""
            ),

            color=variant.color,
            size=variant.size,
            sku=variant.sku,

            quantity=cart_item.quantity,

            unit_price=unit_price,

            total_price=(
                unit_price
                * cart_item.quantity
            ),
        )

        variant.stock -= cart_item.quantity

        variant.save(
            update_fields=[
                "stock",
                "updated_at",
            ]
        )


# ==========================================================
# HELPER - RESTORE STOCK
# ==========================================================

def restore_order_stock(order):
    """
    Restores stock for all items in an order.

    Used when:
    - Razorpay payment fails
    - Customer cancels
    - Admin cancels
    """

    for item in (
        order.items
        .select_related("variant")
        .select_for_update()
    ):

        if not item.variant:
            continue

        item.variant.stock += item.quantity

        item.variant.save(
            update_fields=[
                "stock",
                "updated_at",
            ]
        )


# ==========================================================
# HELPER - RELEASE COUPON RESERVATION
# ==========================================================

def release_coupon_reservation(order):
    """
    Releases coupon reservation for unpaid/cancelled order.
    """

    if not order.coupon_id:
        return

    usage = (
        CouponUsage.objects
        .select_for_update()
        .filter(
            order=order,
            coupon_id=order.coupon_id,
            user=order.user,
        )
        .first()
    )

    if not usage:
        return

    coupon = (
        Coupon.objects
        .select_for_update()
        .filter(
            id=order.coupon_id
        )
        .first()
    )

    usage.delete()

    if coupon and coupon.used_count > 0:

        coupon.used_count -= 1

        coupon.save(
            update_fields=[
                "used_count",
                "updated_at",
            ]
        )




# ==========================================================
# INVOICE PDF + EMAIL
# ==========================================================

def generate_invoice_pdf(order):
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
        title=f"ZIVORA Invoice - {order.order_number}",
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "InvoiceTitle", parent=styles["Title"], alignment=TA_CENTER, fontSize=22, spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        "InvoiceSubtitle", parent=styles["Normal"], alignment=TA_CENTER, fontSize=10, spaceAfter=16
    )
    right_style = ParagraphStyle(
        "Right", parent=styles["Normal"], alignment=TA_RIGHT, fontSize=9
    )
    small_style = ParagraphStyle(
        "Small", parent=styles["Normal"], fontSize=8, leading=10
    )

    story = [
        Paragraph("ZIVORA", title_style),
        Paragraph("FASHION STORE", subtitle_style),
    ]

    invoice_info = [
        [Paragraph("<b>Invoice / Order Number</b>", small_style), Paragraph(str(order.order_number), small_style)],
        [Paragraph("<b>Date</b>", small_style), Paragraph(order.created_at.strftime("%d %B %Y, %I:%M %p"), small_style)],
        [Paragraph("<b>Payment Method</b>", small_style), Paragraph(str(order.get_payment_method_display()), small_style)],
        [Paragraph("<b>Payment Status</b>", small_style), Paragraph(str(order.get_payment_status_display()), small_style)],
    ]
    if order.razorpay_payment_id:
        invoice_info.append([Paragraph("<b>Razorpay Payment ID</b>", small_style), Paragraph(str(order.razorpay_payment_id), small_style)])

    info_table = Table(invoice_info, colWidths=[55 * mm, 125 * mm])
    info_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (0, -1), colors.whitesmoke),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story += [info_table, Spacer(1, 12)]

    customer_text = (
        f"<b>Customer</b><br/>"
        f"{order.full_name}<br/>"
        f"{order.user.email}<br/>"
        f"{order.phone}<br/>"
        f"{order.address_line}, {order.city}<br/>"
        f"{order.state} - {order.pincode}<br/>"
        f"{order.country}"
    )
    customer_table = Table([[Paragraph(customer_text, small_style)]], colWidths=[180 * mm])
    customer_table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.5, colors.grey),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story += [customer_table, Spacer(1, 14)]

    item_rows = [[
        Paragraph("<b>Product</b>", small_style),
        Paragraph("<b>Brand</b>", small_style),
        Paragraph("<b>Size</b>", small_style),
        Paragraph("<b>Color</b>", small_style),
        Paragraph("<b>SKU</b>", small_style),
        Paragraph("<b>Qty</b>", small_style),
        Paragraph("<b>Price</b>", small_style),
        Paragraph("<b>Total</b>", small_style),
    ]]

    for item in order.items.all():
        item_rows.append([
            Paragraph(str(item.product_name), small_style),
            Paragraph(str(item.brand_name or "-"), small_style),
            Paragraph(str(item.size or "-"), small_style),
            Paragraph(str(item.color or "-"), small_style),
            Paragraph(str(item.sku or "-"), small_style),
            Paragraph(str(item.quantity), small_style),
            Paragraph(f"Rs. {item.unit_price}", small_style),
            Paragraph(f"Rs. {item.total_price}", small_style),
        ])

    items_table = Table(item_rows, colWidths=[34*mm, 20*mm, 12*mm, 16*mm, 25*mm, 10*mm, 22*mm, 25*mm], repeatRows=1)
    items_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.35, colors.grey),
        ("BACKGROUND", (0, 0), (-1, 0), colors.whitesmoke),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (5, 1), (-1, -1), "RIGHT"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story += [items_table, Spacer(1, 12)]

    summary_rows = [
        ["Subtotal", f"Rs. {order.subtotal}"],
        ["Discount", f"- Rs. {order.discount}"],
        ["Shipping", f"Rs. {order.shipping_charge}"],
        ["Grand Total", f"Rs. {order.total_amount}"],
    ]
    summary_table = Table(summary_rows, colWidths=[145 * mm, 35 * mm])
    summary_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.35, colors.grey),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("FONTNAME", (0, 3), (-1, 3), "Helvetica-Bold"),
        ("BACKGROUND", (0, 3), (-1, 3), colors.whitesmoke),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story += [summary_table, Spacer(1, 16), Paragraph("Thank you for shopping with ZIVORA.", subtitle_style)]

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


def send_invoice_email_safely(order_id):
    try:
        order = (
            Order.objects
            .select_related("user", "coupon")
            .prefetch_related("items")
            .get(id=order_id)
        )

        if not order.user.email:
            print("Invoice email skipped: user has no email address.")
            return

        pdf_bytes = generate_invoice_pdf(order)
        email = EmailMessage(
            subject=f"ZIVORA Invoice - {order.order_number}",
            body=(
                f"Hello {order.full_name},\n\n"
                f"Thank you for your purchase from ZIVORA.\n"
                f"Your invoice for order {order.order_number} is attached to this email.\n\n"
                f"Regards,\nZIVORA FASHION STORE"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[order.user.email],
        )
        email.attach(
            f"ZIVORA-Invoice-{order.order_number}.pdf",
            pdf_bytes,
            "application/pdf",
        )
        email.send(fail_silently=False)
        print(f"Invoice email sent for order {order.order_number}.")
    except Exception as exc:
        print(f"Invoice email error for order {order_id}: {exc}")


# ==========================================================
# CREATE ORDER
# ==========================================================

class CreateOrderView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        # --------------------------------------------------
        # GET USER CART
        # --------------------------------------------------

        cart = get_object_or_404(
            Cart.objects.prefetch_related(
                "items__product__brand",
                "items__variant",
            ),
            user=request.user,
        )

        cart_items = list(
            cart.items.all()
        )

        if not cart_items:

            return Response(
                {
                    "detail":
                    "Your cart is empty."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # GET ADDRESS
        # --------------------------------------------------

        address_id = request.data.get(
            "address_id"
        )

        if not address_id:

            return Response(
                {
                    "detail":
                    "Address is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            address_id = int(address_id)

        except (
            TypeError,
            ValueError,
        ):

            return Response(
                {
                    "detail":
                    "Invalid address ID."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        address = Address.objects.filter(
            id=address_id,
            user=request.user,
        ).first()

        if not address:

            return Response(
                {
                    "detail":
                    "Address not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # --------------------------------------------------
        # PAYMENT METHOD
        # --------------------------------------------------

        payment_method = request.data.get(
            "payment_method",
            "COD",
        )

        payment_method = str(
            payment_method
        ).upper()

        if payment_method not in [
            "COD",
            "ONLINE",
        ]:

            return Response(
                {
                    "detail":
                    "Invalid payment method."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # LOCK + VALIDATE STOCK
        # --------------------------------------------------

        for cart_item in cart_items:

            product = cart_item.product
            variant = cart_item.variant

            if not product.is_active:

                return Response(
                    {
                        "detail":
                        (
                            f"{product.name} "
                            "is no longer available."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not variant.is_active:

                return Response(
                    {
                        "detail":
                        (
                            f"{product.name} "
                            f"({variant.color} / "
                            f"{variant.size}) "
                            "is no longer available."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if variant.stock < cart_item.quantity:

                return Response(
                    {
                        "detail":
                        (
                            f"Only {variant.stock} item(s) "
                            f"are available for "
                            f"{product.name} "
                            f"({variant.color} / "
                            f"{variant.size})."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # --------------------------------------------------
        # CALCULATE SUBTOTAL
        # --------------------------------------------------

        subtotal = sum(
            (
                item.product.final_price
                * item.quantity
                for item in cart_items
            ),
            Decimal("0.00"),
        )

        shipping_charge = Decimal(
            "0.00"
        )

        # --------------------------------------------------
        # COUPON
        # --------------------------------------------------

        coupon = None

        discount = Decimal(
            "0.00"
        )

        coupon_id = request.data.get(
            "coupon_id"
        )

        if coupon_id:

            try:

                coupon_id = int(
                    coupon_id
                )

            except (
                TypeError,
                ValueError,
            ):

                return Response(
                    {
                        "detail":
                        "Invalid coupon."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            coupon = (
                Coupon.objects
                .select_for_update()
                .filter(
                    id=coupon_id,
                    is_active=True,
                )
                .first()
            )

            if not coupon:

                return Response(
                    {
                        "detail":
                        "Coupon is invalid or inactive."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:

                discount = (
                    calculate_coupon_discount(
                        coupon,
                        request.user,
                        subtotal,
                    )
                )

            except ValueError as exc:

                return Response(
                    {
                        "detail":
                        str(exc)
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # --------------------------------------------------
        # FINAL TOTAL
        # --------------------------------------------------

        total_amount = (
            subtotal
            + shipping_charge
            - discount
        )

        if total_amount < Decimal(
            "0.00"
        ):

            total_amount = Decimal(
                "0.00"
            )

        # ==================================================
        # CREATE LOCAL ORDER
        # ==================================================

        order = Order.objects.create(

            user=request.user,

            order_number=generate_order_number(),

            full_name=address.full_name,
            phone=address.phone,
            address_line=address.address_line,
            city=address.city,
            state=address.state,
            pincode=address.pincode,
            country=address.country,

            subtotal=subtotal,
            shipping_charge=shipping_charge,
            discount=discount,
            total_amount=total_amount,

            coupon=coupon,

            payment_method=payment_method,
            payment_status="PENDING",
            status="PENDING",

            notes=request.data.get(
                "notes",
                "",
            ),
        )

        # ==================================================
        # CREATE ORDER ITEMS
        # + RESERVE STOCK
        # ==================================================

        try:

            create_order_items_and_reserve_stock(
                order,
                cart_items,
            )

        except Exception as exc:

            print(
                "Order item creation error:",
                exc,
            )

            order.delete()

            return Response(
                {
                    "detail":
                    "Unable to reserve product stock."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ==================================================
        # ONLINE PAYMENT
        # ==================================================

        if payment_method == "ONLINE":

            # --------------------------------------------------
            # RESERVE COUPON USAGE
            # --------------------------------------------------

            if coupon:

                CouponUsage.objects.create(
                    coupon=coupon,
                    user=request.user,
                    order=order,
                    discount_amount=discount,
                )

                coupon.used_count += 1

                coupon.save(
                    update_fields=[
                        "used_count",
                        "updated_at",
                    ]
                )

            # --------------------------------------------------
            # CREATE RAZORPAY ORDER
            # --------------------------------------------------

            try:

                client = get_razorpay_client()

                razorpay_order = (
                    client.order.create(
                        {
                            "amount": int(
                                total_amount
                                * Decimal("100")
                            ),

                            "currency": "INR",

                            "receipt":
                                order.order_number,

                            "notes": {
                                "order_number":
                                    order.order_number,

                                "user_id":
                                    str(
                                        request.user.id
                                    ),
                            },
                        }
                    )
                )

            except Exception as exc:

                print(
                    "Razorpay order creation error:",
                    exc,
                )

                # Restore stock
                restore_order_stock(
                    order
                )

                # Release coupon reservation
                release_coupon_reservation(
                    order
                )

                order.delete()

                return Response(
                    {
                        "detail":
                        "Unable to create online payment."
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            # --------------------------------------------------
            # SAVE RAZORPAY ORDER ID
            # --------------------------------------------------

            order.razorpay_order_id = (
                razorpay_order["id"]
            )

            order.save(
                update_fields=[
                    "razorpay_order_id",
                    "updated_at",
                ]
            )

            # --------------------------------------------------
            # CLEAR CART
            # --------------------------------------------------

            cart.items.all().delete()

            # --------------------------------------------------
            # SERIALIZE LOCAL ORDER
            # --------------------------------------------------

            serializer = OrderSerializer(
                order,
                context={
                    "request": request,
                },
            )

            # --------------------------------------------------
            # RAZORPAY RESPONSE
            # --------------------------------------------------

            return Response(
                {
                    "detail":
                    "Razorpay order created.",

                    "order":
                    serializer.data,

                    "order_id":
                    order.id,

                    "order_number":
                    order.order_number,

                    "razorpay_key":
                    settings.RAZORPAY_KEY_ID,

                    "razorpay":
                    {
                        "id":
                        razorpay_order["id"],

                        "amount":
                        int(
                            total_amount
                            * Decimal("100")
                        ),

                        "currency":
                        "INR",
                    },

                    "total_amount":
                    str(
                        total_amount
                    ),
                },
                status=status.HTTP_201_CREATED,
            )

        # ==================================================
        # COD COUPON USAGE
        # ==================================================

        if coupon:

            CouponUsage.objects.create(
                coupon=coupon,
                user=request.user,
                order=order,
                discount_amount=discount,
            )

            coupon.used_count += 1

            coupon.save(
                update_fields=[
                    "used_count",
                    "updated_at",
                ]
            )

        # --------------------------------------------------
        # CLEAR CART
        # --------------------------------------------------

        cart.items.all().delete()

        # --------------------------------------------------
        # SERIALIZER
        # --------------------------------------------------

        serializer = OrderSerializer(
            order,
            context={
                "request": request,
            },
        )

        # --------------------------------------------------
        # COD RESPONSE
        # --------------------------------------------------

        return Response(
            {
                "detail":
                "Order placed successfully.",

                "order":
                serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


# ==========================================================
# VERIFY RAZORPAY PAYMENT
# ==========================================================

class VerifyRazorpayPaymentView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        # --------------------------------------------------
        # GET PAYMENT DATA
        # --------------------------------------------------

        order_id = request.data.get(
            "order_id"
        )

        razorpay_order_id = request.data.get(
            "razorpay_order_id"
        )

        razorpay_payment_id = request.data.get(
            "razorpay_payment_id"
        )

        razorpay_signature = request.data.get(
            "razorpay_signature"
        )

        # --------------------------------------------------
        # VALIDATE DATA
        # --------------------------------------------------

        if not all(
            [
                order_id,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            ]
        ):

            return Response(
                {
                    "detail":
                    "Payment verification data is incomplete."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # GET ORDER
        # --------------------------------------------------

        order = get_object_or_404(
            Order.objects.select_for_update(),
            id=order_id,
            user=request.user,
        )

        # --------------------------------------------------
        # CHECK PAYMENT METHOD
        # --------------------------------------------------

        if order.payment_method != "ONLINE":

            return Response(
                {
                    "detail":
                    "This is not an online payment order."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # ALREADY PAID
        # --------------------------------------------------

        if order.payment_status == "PAID":

            serializer = OrderSerializer(
                order,
                context={
                    "request": request,
                },
            )

            return Response(
                {
                    "detail":
                    "Payment already verified.",

                    "order":
                    serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        # --------------------------------------------------
        # VALIDATE RAZORPAY ORDER ID
        # --------------------------------------------------

        if (
            order.razorpay_order_id
            != razorpay_order_id
        ):

            return Response(
                {
                    "detail":
                    "Invalid Razorpay order."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # VERIFY RAZORPAY SIGNATURE
        # --------------------------------------------------

        try:

            client = get_razorpay_client()

            client.utility.verify_payment_signature(
                {
                    "razorpay_order_id":
                        razorpay_order_id,

                    "razorpay_payment_id":
                        razorpay_payment_id,

                    "razorpay_signature":
                        razorpay_signature,
                }
            )

        except razorpay.errors.SignatureVerificationError:

            # ----------------------------------------------
            # PAYMENT VERIFICATION FAILED
            # ----------------------------------------------

            order.payment_status = "FAILED"

            order.status = "CANCELLED"

            order.cancellation_reason = (
                "Razorpay payment verification failed"
            )

            order.cancelled_at = timezone.now()

            # Restore stock
            restore_order_stock(
                order
            )

            # Release coupon
            release_coupon_reservation(
                order
            )

            order.save(
                update_fields=[
                    "payment_status",
                    "status",
                    "cancellation_reason",
                    "cancelled_at",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "detail":
                    "Payment verification failed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as exc:

            print(
                "Razorpay verification error:",
                exc,
            )

            return Response(
                {
                    "detail":
                    "Unable to verify payment."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # ==================================================
        # PAYMENT SUCCESS
        # ==================================================

        order.payment_status = "PAID"

        order.status = "CONFIRMED"

        order.razorpay_payment_id = (
            razorpay_payment_id
        )

        order.razorpay_signature = (
            razorpay_signature
        )

        order.save(
            update_fields=[
                "payment_status",
                "status",
                "razorpay_payment_id",
                "razorpay_signature",
                "updated_at",
            ]
        )

        # Generate and email invoice only after the successful
        # payment transaction has been committed.
        transaction.on_commit(
            lambda order_id=order.id: send_invoice_email_safely(order_id)
        )

        # --------------------------------------------------
        # RESPONSE
        # --------------------------------------------------

        serializer = OrderSerializer(
            order,
            context={
                "request": request,
            },
        )

        return Response(
            {
                "detail":
                "Payment verified successfully.",

                "order":
                serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# ==========================================================
# RAZORPAY PAYMENT FAILED
# ==========================================================

class RazorpayPaymentFailedView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        order_id = request.data.get(
            "order_id"
        )

        razorpay_order_id = request.data.get(
            "razorpay_order_id"
        )

        if not order_id:

            return Response(
                {
                    "detail":
                    "Order ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # GET ORDER
        # --------------------------------------------------

        order = get_object_or_404(
            Order.objects.select_for_update(),
            id=order_id,
            user=request.user,
        )

        # --------------------------------------------------
        # CHECK PAYMENT METHOD
        # --------------------------------------------------

        if order.payment_method != "ONLINE":

            return Response(
                {
                    "detail":
                    "This is not an online payment order."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # ALREADY PAID
        # --------------------------------------------------

        if order.payment_status == "PAID":

            serializer = OrderSerializer(
                order,
                context={
                    "request": request,
                },
            )

            return Response(
                {
                    "detail":
                    "Payment was already completed.",

                    "order":
                    serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        # --------------------------------------------------
        # VALIDATE RAZORPAY ORDER ID
        # --------------------------------------------------

        if (
            razorpay_order_id
            and order.razorpay_order_id
            != razorpay_order_id
        ):

            return Response(
                {
                    "detail":
                    "Invalid Razorpay order."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # RESTORE STOCK
        # --------------------------------------------------

        restore_order_stock(
            order
        )

        # --------------------------------------------------
        # RELEASE COUPON
        # --------------------------------------------------

        release_coupon_reservation(
            order
        )

        # --------------------------------------------------
        # UPDATE ORDER
        # --------------------------------------------------

        order.payment_status = "FAILED"

        order.status = "CANCELLED"

        order.cancellation_reason = (
            request.data.get(
                "reason",
                "Razorpay payment failed.",
            )
        )

        order.cancellation_note = (
            request.data.get(
                "note",
                "",
            )
        )

        order.cancelled_at = timezone.now()

        order.save()

        # --------------------------------------------------
        # RESPONSE
        # --------------------------------------------------

        serializer = OrderSerializer(
            order,
            context={
                "request": request,
            },
        )

        return Response(
            {
                "detail":
                "Payment failed. Order cancelled and stock restored.",

                "order":
                serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# ==========================================================
# MY ORDERS
# ==========================================================

class MyOrdersView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        orders = (
            Order.objects
            .filter(
                user=request.user
            )
            .prefetch_related(
                "items__product",
                "items__variant",
            )
            .order_by(
                "-created_at"
            )
        )

        serializer = OrderSerializer(
            orders,
            many=True,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


# ==========================================================
# ORDER DETAIL
# ==========================================================

class OrderDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(
        self,
        request,
        order_id,
    ):

        order = get_object_or_404(
            Order.objects.prefetch_related(
                "items__product",
                "items__variant",
            ),
            id=order_id,
            user=request.user,
        )

        serializer = OrderSerializer(
            order,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


# ==========================================================
# CANCEL ORDER
# ==========================================================

class CancelOrderView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(
        self,
        request,
        order_id,
    ):

        order = get_object_or_404(
            Order.objects.select_for_update(),
            id=order_id,
            user=request.user,
        )

        cancellable_statuses = [
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
        ]

        if order.status not in cancellable_statuses:

            return Response(
                {
                    "detail":
                    (
                        "This order can no longer "
                        "be cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = request.data.get(
            "reason",
            "Cancelled by customer",
        )

        note = request.data.get(
            "note",
            "",
        )

        # --------------------------------------------------
        # RESTORE STOCK
        # --------------------------------------------------

        restore_order_stock(
            order
        )

        # --------------------------------------------------
        # RELEASE COUPON ONLY IF NOT PAID
        # --------------------------------------------------

        if order.payment_status != "PAID":

            release_coupon_reservation(
                order
            )

        # --------------------------------------------------
        # UPDATE ORDER
        # --------------------------------------------------

        order.status = "CANCELLED"

        order.cancellation_reason = reason

        order.cancellation_note = note

        order.cancelled_at = timezone.now()

        if order.payment_status == "PAID":

            order.payment_status = (
                "REFUND_PENDING"
            )

            order.refund_amount = (
                order.total_amount
            )

        order.save()

        # --------------------------------------------------
        # RESPONSE
        # --------------------------------------------------

        serializer = OrderSerializer(
            order,
            context={
                "request": request,
            },
        )

        return Response(
            {
                "detail":
                "Order cancelled successfully.",

                "order":
                serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# ==========================================================
# REQUEST RETURN
# ==========================================================

class RequestReturnView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(
        self,
        request,
        order_id,
    ):

        order = get_object_or_404(
            Order.objects.select_for_update(),
            id=order_id,
            user=request.user,
        )

        if order.status != "DELIVERED":

            return Response(
                {
                    "detail":
                    (
                        "Only delivered orders "
                        "can be returned."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = request.data.get(
            "reason"
        )

        if not reason:

            return Response(
                {
                    "detail":
                    "Return reason is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid_reasons = [
            choice[0]
            for choice in Order.RETURN_REASON_CHOICES
        ]

        if reason not in valid_reasons:

            return Response(
                {
                    "detail":
                    "Invalid return reason."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        note = request.data.get(
            "note",
            "",
        )

        order.status = "RETURN_REQUESTED"

        order.return_reason = reason

        order.return_note = note

        order.return_requested_at = (
            timezone.now()
        )

        order.save()

        # --------------------------------------------------
        # RESPONSE
        # --------------------------------------------------

        serializer = OrderSerializer(
            order,
            context={
                "request": request,
            },
        )

        return Response(
            {
                "detail":
                "Return request submitted successfully.",

                "order":
                serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# ==========================================================
# ADMIN ORDERS LIST
# ==========================================================

class AdminOrdersView(APIView):

    permission_classes = [IsAuthenticated]

    def get(
        self,
        request,
    ):

        if not request.user.is_staff:

            return Response(
                {
                    "detail":
                    "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        orders = (
            Order.objects
            .select_related(
                "user",
                "coupon",
            )
            .prefetch_related(
                "items__product",
                "items__variant",
            )
            .all()
            .order_by(
                "-created_at"
            )
        )

        order_status = request.query_params.get(
            "status"
        )

        if order_status:

            orders = orders.filter(
                status=order_status.upper()
            )

        payment_status = request.query_params.get(
            "payment_status"
        )

        if payment_status:

            orders = orders.filter(
                payment_status=payment_status.upper()
            )

        search = request.query_params.get(
            "search"
        )

        if search:

            orders = orders.filter(
                Q(
                    order_number__icontains=search
                )
                | Q(
                    full_name__icontains=search
                )
                | Q(
                    phone__icontains=search
                )
                | Q(
                    user__email__icontains=search
                )
                | Q(
                    coupon__code__icontains=search
                )
            )

        serializer = OrderSerializer(
            orders,
            many=True,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


# ==========================================================
# ADMIN ORDER DETAIL
# ==========================================================

class AdminOrderDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get_order(
        self,
        request,
        order_id,
    ):

        if not request.user.is_staff:

            return None

        return get_object_or_404(
            Order.objects
            .select_related(
                "user",
                "coupon",
            )
            .prefetch_related(
                "items__product",
                "items__variant",
            ),
            id=order_id,
        )

    def get(
        self,
        request,
        order_id,
    ):

        order = self.get_order(
            request,
            order_id,
        )

        if not order:

            return Response(
                {
                    "detail":
                    "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = OrderSerializer(
            order,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    @transaction.atomic
    def patch(
        self,
        request,
        order_id,
    ):

        order = self.get_order(
            request,
            order_id,
        )

        if not order:

            return Response(
                {
                    "detail":
                    "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        new_status = request.data.get(
            "status"
        )

        new_payment_status = request.data.get(
            "payment_status"
        )

        # --------------------------------------------------
        # ORDER STATUS
        # --------------------------------------------------

        if new_status:

            valid_statuses = [
                choice[0]
                for choice in Order.STATUS_CHOICES
            ]

            new_status = str(
                new_status
            ).upper()

            if new_status not in valid_statuses:

                return Response(
                    {
                        "detail":
                        "Invalid order status."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # --------------------------------------------------
            # ADMIN CANCEL
            # --------------------------------------------------

            if (
                new_status == "CANCELLED"
                and order.status != "CANCELLED"
            ):

                restore_order_stock(
                    order
                )

                if order.payment_status != "PAID":

                    release_coupon_reservation(
                        order
                    )

                order.cancellation_reason = (
                    request.data.get(
                        "cancellation_reason",
                        "Cancelled by admin",
                    )
                )

                order.cancellation_note = (
                    request.data.get(
                        "cancellation_note",
                        "",
                    )
                )

                order.cancelled_at = (
                    timezone.now()
                )

                if order.payment_status == "PAID":

                    order.payment_status = (
                        "REFUND_PENDING"
                    )

                    order.refund_amount = (
                        order.total_amount
                    )

            order.status = new_status

        # --------------------------------------------------
        # PAYMENT STATUS
        # --------------------------------------------------

        if new_payment_status:

            valid_payment_statuses = [
                choice[0]
                for choice in Order.PAYMENT_STATUS_CHOICES
            ]

            new_payment_status = str(
                new_payment_status
            ).upper()

            if (
                new_payment_status
                not in valid_payment_statuses
            ):

                return Response(
                    {
                        "detail":
                        "Invalid payment status."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            order.payment_status = (
                new_payment_status
            )

        # --------------------------------------------------
        # REFUND AMOUNT
        # --------------------------------------------------

        if "refund_amount" in request.data:

            try:

                refund_amount = Decimal(
                    str(
                        request.data.get(
                            "refund_amount"
                        )
                    )
                )

                if refund_amount < 0:

                    return Response(
                        {
                            "detail":
                            "Refund amount cannot be negative."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                order.refund_amount = (
                    refund_amount
                )

            except (
                TypeError,
                ValueError,
            ):

                return Response(
                    {
                        "detail":
                        "Invalid refund amount."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # --------------------------------------------------
        # REFUND REFERENCE
        # --------------------------------------------------

        if "refund_reference" in request.data:

            order.refund_reference = (
                request.data.get(
                    "refund_reference"
                )
            )

        # --------------------------------------------------
        # REFUND PROCESSED
        # --------------------------------------------------

        if (
            new_payment_status
            == "REFUNDED"
        ):

            order.refund_processed_at = (
                timezone.now()
            )

        order.save()

        # --------------------------------------------------
        # RESPONSE
        # --------------------------------------------------

        serializer = OrderSerializer(
            order,
            context={
                "request": request,
            },
        )

        return Response(
            {
                "detail":
                "Order updated successfully.",

                "order":
                serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# ==========================================================
# ADMIN DASHBOARD STATS
# ==========================================================

class AdminDashboardStatsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(
        self,
        request,
    ):

        if not request.user.is_staff:

            return Response(
                {
                    "detail":
                    "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        total_orders = (
            Order.objects.count()
        )

        pending_orders = (
            Order.objects
            .filter(
                status="PENDING"
            )
            .count()
        )

        processing_orders = (
            Order.objects
            .filter(
                status="PROCESSING"
            )
            .count()
        )

        shipped_orders = (
            Order.objects
            .filter(
                status="SHIPPED"
            )
            .count()
        )

        delivered_orders = (
            Order.objects
            .filter(
                status="DELIVERED"
            )
            .count()
        )

        cancelled_orders = (
            Order.objects
            .filter(
                status="CANCELLED"
            )
            .count()
        )

        return_requests = (
            Order.objects
            .filter(
                status="RETURN_REQUESTED"
            )
            .count()
        )

        total_revenue = (
            Order.objects
            .filter(
                payment_status="PAID"
            )
            .aggregate(
                total=Sum(
                    "total_amount"
                )
            )["total"]
            or Decimal("0.00")
        )

        return Response(
            {
                "total_orders":
                    total_orders,

                "pending_orders":
                    pending_orders,

                "processing_orders":
                    processing_orders,

                "shipped_orders":
                    shipped_orders,

                "delivered_orders":
                    delivered_orders,

                "cancelled_orders":
                    cancelled_orders,

                "return_requests":
                    return_requests,

                "total_revenue":
                    total_revenue,
            },
            status=status.HTTP_200_OK,
        )