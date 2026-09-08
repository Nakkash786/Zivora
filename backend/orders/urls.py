from django.urls import path

from .views import (
    CreateOrderView,
    VerifyRazorpayPaymentView,
    RazorpayPaymentFailedView,
    MyOrdersView,
    OrderDetailView,
    CancelOrderView,
    RequestReturnView,
    AdminOrdersView,
    AdminOrderDetailView,
    AdminDashboardStatsView,
)


urlpatterns = [

    # ==========================================================
    # USER ORDER ROUTES
    # ==========================================================

    # Create order / Razorpay payment order
    path(
        "create/",
        CreateOrderView.as_view(),
        name="order-create",
    ),

    # Verify successful Razorpay payment
    path(
        "razorpay/verify/",
        VerifyRazorpayPaymentView.as_view(),
        name="razorpay-payment-verify",
    ),

    # Handle failed/cancelled Razorpay payment
    path(
        "razorpay/failed/",
        RazorpayPaymentFailedView.as_view(),
        name="razorpay-payment-failed",
    ),

    # Logged-in user's orders
    path(
        "",
        MyOrdersView.as_view(),
        name="my-orders",
    ),

    # Order details
    path(
        "<int:order_id>/",
        OrderDetailView.as_view(),
        name="order-detail",
    ),

    # Cancel order
    path(
        "<int:order_id>/cancel/",
        CancelOrderView.as_view(),
        name="order-cancel",
    ),

    # Request return
    path(
        "<int:order_id>/return/",
        RequestReturnView.as_view(),
        name="order-return",
    ),


    # ==========================================================
    # ADMIN ORDER ROUTES
    # ==========================================================

    # All orders for admin
    path(
        "admin/",
        AdminOrdersView.as_view(),
        name="admin-orders",
    ),

    # Admin order details + update
    path(
        "admin/<int:order_id>/",
        AdminOrderDetailView.as_view(),
        name="admin-order-detail",
    ),

    # Admin dashboard order statistics
    path(
        "admin/dashboard/",
        AdminDashboardStatsView.as_view(),
        name="admin-dashboard-stats",
    ),
]