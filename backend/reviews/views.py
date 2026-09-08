from django.shortcuts import get_object_or_404

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product
from orders.models import Order, OrderItem

from .models import Review
from .serializers import ReviewSerializer


# ==========================================================
# USER REVIEWS
# ==========================================================

class ProductReviewsView(APIView):
    """
    Public endpoint:
    Get approved reviews for a product.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)

        reviews = (
            Review.objects
            .filter(
                product=product,
                status="APPROVED"
            )
            .select_related("user", "product", "order")
        )

        serializer = ReviewSerializer(
            reviews,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


class CreateReviewView(APIView):
    """
    Logged-in user can create a review.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):

        product_id = request.data.get("product")
        order_id = request.data.get("order")

        if not product_id:
            return Response(
                {"detail": "Product is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        product = get_object_or_404(
            Product,
            id=product_id
        )

        order = None

        # --------------------------------------------------
        # If order is supplied, verify ownership
        # --------------------------------------------------

        if order_id:
            order = get_object_or_404(
                Order,
                id=order_id,
                user=request.user
            )

            # Check whether this product belongs to the order
            product_in_order = OrderItem.objects.filter(
                order=order,
                product=product
            ).exists()

            if not product_in_order:
                return Response(
                    {
                        "detail":
                        "This product is not part of the selected order."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        # --------------------------------------------------
        # Prevent duplicate review
        # --------------------------------------------------

        existing_review = Review.objects.filter(
            user=request.user,
            product=product,
            order=order
        ).first()

        if existing_review:
            return Response(
                {
                    "detail":
                    "You have already reviewed this product."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # Validate rating
        # --------------------------------------------------

        rating = request.data.get("rating")

        try:
            rating = int(rating)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Rating must be between 1 and 5."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if rating < 1 or rating > 5:
            return Response(
                {"detail": "Rating must be between 1 and 5."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # Comment validation
        # --------------------------------------------------

        comment = str(
            request.data.get("comment", "")
        ).strip()

        if not comment:
            return Response(
                {"detail": "Review comment is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # Create review
        # --------------------------------------------------

        review = Review.objects.create(
            user=request.user,
            product=product,
            order=order,
            rating=rating,
            title=str(
                request.data.get("title", "")
            ).strip(),
            comment=comment,
            status="PENDING"
        )

        serializer = ReviewSerializer(
            review,
            context={"request": request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class MyReviewsView(APIView):
    """
    Get reviews created by logged-in user.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        reviews = (
            Review.objects
            .filter(user=request.user)
            .select_related("user", "product", "order")
        )

        serializer = ReviewSerializer(
            reviews,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


# ==========================================================
# ADMIN REVIEWS
# ==========================================================

class IsAdminUser(permissions.BasePermission):

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class AdminReviewsView(APIView):
    """
    Admin:
    List all reviews.
    """

    permission_classes = [IsAdminUser]

    def get(self, request):

        reviews = (
            Review.objects
            .select_related(
                "user",
                "product",
                "order"
            )
            .all()
        )

        # --------------------------------------------------
        # Search
        # --------------------------------------------------

        search = request.query_params.get(
            "search",
            ""
        ).strip()

        if search:
            from django.db.models import Q

            reviews = reviews.filter(
                Q(user__username__icontains=search)
                | Q(user__email__icontains=search)
                | Q(product__name__icontains=search)
                | Q(comment__icontains=search)
                | Q(title__icontains=search)
            )

        # --------------------------------------------------
        # Status filter
        # --------------------------------------------------

        review_status = request.query_params.get(
            "status"
        )

        if review_status:
            reviews = reviews.filter(
                status=review_status.upper()
            )

        # --------------------------------------------------
        # Rating filter
        # --------------------------------------------------

        rating = request.query_params.get(
            "rating"
        )

        if rating:
            try:
                reviews = reviews.filter(
                    rating=int(rating)
                )
            except ValueError:
                pass

        serializer = ReviewSerializer(
            reviews,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


class AdminReviewDetailView(APIView):
    """
    Admin:
    View, update, approve, reject or delete a review.
    """

    permission_classes = [IsAdminUser]

    def get_object(self, review_id):
        return get_object_or_404(
            Review.objects.select_related(
                "user",
                "product",
                "order"
            ),
            id=review_id
        )

    # ------------------------------------------------------
    # GET
    # ------------------------------------------------------

    def get(self, request, review_id):

        review = self.get_object(review_id)

        serializer = ReviewSerializer(
            review,
            context={"request": request}
        )

        return Response(serializer.data)

    # ------------------------------------------------------
    # PATCH
    # ------------------------------------------------------

    def patch(self, request, review_id):

        review = self.get_object(review_id)

        allowed_fields = [
            "rating",
            "title",
            "comment",
            "status",
            "admin_note",
        ]

        for field in allowed_fields:

            if field in request.data:

                value = request.data[field]

                if field == "rating":

                    try:
                        value = int(value)
                    except (TypeError, ValueError):
                        return Response(
                            {
                                "detail":
                                "Rating must be between 1 and 5."
                            },
                            status=status.HTTP_400_BAD_REQUEST
                        )

                    if value < 1 or value > 5:
                        return Response(
                            {
                                "detail":
                                "Rating must be between 1 and 5."
                            },
                            status=status.HTTP_400_BAD_REQUEST
                        )

                if field == "status":

                    value = str(value).upper()

                    if value not in [
                        "PENDING",
                        "APPROVED",
                        "REJECTED"
                    ]:
                        return Response(
                            {
                                "detail":
                                "Invalid review status."
                            },
                            status=status.HTTP_400_BAD_REQUEST
                        )

                setattr(
                    review,
                    field,
                    value
                )

        review.save()

        serializer = ReviewSerializer(
            review,
            context={"request": request}
        )

        return Response(serializer.data)

    # ------------------------------------------------------
    # DELETE
    # ------------------------------------------------------

    def delete(self, request, review_id):

        review = self.get_object(review_id)

        review.delete()

        return Response(
            {
                "detail":
                "Review deleted successfully."
            },
            status=status.HTTP_200_OK
        )