from django.db.models import Q
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Coupon, CouponUsage
from .serializers import (
    CouponSerializer,
    CouponUsageSerializer,
)


class IsAdminUser:
    """
    Simple admin permission helper.
    """

    @staticmethod
    def check(request):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class AdminCouponsView(APIView):

    def get(self, request):

        if not IsAdminUser.check(request):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        coupons = Coupon.objects.all()

        search = request.query_params.get("search", "").strip()
        coupon_status = request.query_params.get("status", "").strip()

        if search:
            coupons = coupons.filter(
                Q(code__icontains=search)
                | Q(description__icontains=search)
            )

        if coupon_status == "ACTIVE":
            coupons = coupons.filter(is_active=True)

        elif coupon_status == "INACTIVE":
            coupons = coupons.filter(is_active=False)

        serializer = CouponSerializer(
            coupons,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)

    def post(self, request):

        if not IsAdminUser.check(request):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CouponSerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():
            coupon = serializer.save()

            return Response(
                CouponSerializer(
                    coupon,
                    context={"request": request}
                ).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class AdminCouponDetailView(APIView):

    def get_coupon(self, coupon_id):

        try:
            return Coupon.objects.get(id=coupon_id)
        except Coupon.DoesNotExist:
            return None

    def get(self, request, coupon_id):

        if not IsAdminUser.check(request):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        coupon = self.get_coupon(coupon_id)

        if not coupon:
            return Response(
                {"detail": "Coupon not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CouponSerializer(
            coupon,
            context={"request": request}
        )

        return Response(serializer.data)

    def patch(self, request, coupon_id):

        if not IsAdminUser.check(request):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        coupon = self.get_coupon(coupon_id)

        if not coupon:
            return Response(
                {"detail": "Coupon not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CouponSerializer(
            coupon,
            data=request.data,
            partial=True,
            context={"request": request}
        )

        if serializer.is_valid():
            coupon = serializer.save()

            return Response(
                CouponSerializer(
                    coupon,
                    context={"request": request}
                ).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, coupon_id):

        if not IsAdminUser.check(request):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        coupon = self.get_coupon(coupon_id)

        if not coupon:
            return Response(
                {"detail": "Coupon not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        coupon.delete()

        return Response(
            {"message": "Coupon deleted successfully."},
            status=status.HTTP_200_OK
        )


class ValidateCouponView(APIView):

    def post(self, request):

        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        code = request.data.get("code", "").strip().upper()
        order_amount = request.data.get("order_amount", 0)

        if not code:
            return Response(
                {"detail": "Coupon code is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order_amount = float(order_amount)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Invalid order amount."},
                status=status.HTTP_400_BAD_REQUEST
            )

        now = timezone.now()

        try:
            coupon = Coupon.objects.get(
                code=code
            )
        except Coupon.DoesNotExist:
            return Response(
                {"detail": "Invalid coupon code."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not coupon.is_active:
            return Response(
                {"detail": "This coupon is inactive."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if now < coupon.valid_from:
            return Response(
                {"detail": "This coupon is not active yet."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if now > coupon.valid_until:
            return Response(
                {"detail": "This coupon has expired."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if (
            coupon.usage_limit is not None
            and coupon.used_count >= coupon.usage_limit
        ):
            return Response(
                {"detail": "This coupon usage limit has been reached."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_usage_count = CouponUsage.objects.filter(
            coupon=coupon,
            user=request.user
        ).count()

        if user_usage_count >= coupon.usage_limit_per_user:
            return Response(
                {"detail": "You have already used this coupon."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if order_amount < float(coupon.min_order_amount):
            return Response(
                {
                    "detail": (
                        f"Minimum order amount is "
                        f"₹{coupon.min_order_amount}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if coupon.discount_type == "PERCENTAGE":

            discount = (
                order_amount
                * float(coupon.discount_value)
                / 100
            )

            if coupon.max_discount_amount is not None:
                discount = min(
                    discount,
                    float(coupon.max_discount_amount)
                )

        else:
            discount = float(coupon.discount_value)

        discount = min(discount, order_amount)

        final_amount = order_amount - discount

        return Response({
            "valid": True,
            "coupon_id": coupon.id,
            "code": coupon.code,
            "discount_type": coupon.discount_type,
            "discount_value": str(coupon.discount_value),
            "discount_amount": round(discount, 2),
            "order_amount": round(order_amount, 2),
            "final_amount": round(final_amount, 2),
            "message": "Coupon applied successfully.",
        })


class AdminCouponUsageView(APIView):

    def get(self, request):

        if not IsAdminUser.check(request):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        usages = CouponUsage.objects.select_related(
            "coupon",
            "user",
            "order"
        ).all()

        serializer = CouponUsageSerializer(
            usages,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)