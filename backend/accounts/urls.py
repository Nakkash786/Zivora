from django.urls import path

from .views import (
    RegisterView,
    VerifyOTPView,
    ResendOTPView,
    ForgotPasswordView,
    VerifyPasswordResetOTPView,
    ResetPasswordView,
    ChangePasswordView,
    LogoutView,
    LoginView,
    ProfileView,
    AddressView,
    AddressDetailView,
    AdminProfileView,
    AdminCustomersView,
    AdminCustomerDetailView,
)

from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [

    # ======================================================
    # JWT TOKEN REFRESH
    # ======================================================

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

    # ======================================================
    # ADMIN
    # ======================================================

    # Admin Profile
    path(
        "admin/profile/",
        AdminProfileView.as_view(),
        name="admin-profile",
    ),

    # Admin Customers - List
    path(
        "admin/customers/",
        AdminCustomersView.as_view(),
        name="admin-customers",
    ),

    # Admin Customer - Detail
    path(
        "admin/customers/<int:pk>/",
        AdminCustomerDetailView.as_view(),
        name="admin-customer-detail",
    ),

    # ======================================================
    # AUTHENTICATION
    # ======================================================

    # Register
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    # Verify Email OTP
    path(
        "verify-otp/",
        VerifyOTPView.as_view(),
        name="verify-otp",
    ),

    # Resend OTP
    path(
        "resend-otp/",
        ResendOTPView.as_view(),
        name="resend-otp",
    ),

    # Forgot Password
    path(
        "forgot-password/",
        ForgotPasswordView.as_view(),
        name="forgot-password",
    ),

    # Verify Password Reset OTP
    path(
        "verify-password-reset-otp/",
        VerifyPasswordResetOTPView.as_view(),
        name="verify-password-reset-otp",
    ),

    # Reset Password
    path(
        "reset-password/",
        ResetPasswordView.as_view(),
        name="reset-password",
    ),

    # Change Password
    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),

    # Logout
    path(
        "logout/",
        LogoutView.as_view(),
        name="logout",
    ),

    # Login
    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    # ======================================================
    # USER PROFILE
    # ======================================================

    # Profile
    path(
        "profile/",
        ProfileView.as_view(),
        name="profile",
    ),

    # ======================================================
    # ADDRESSES
    # ======================================================

    # User Addresses
    path(
        "addresses/",
        AddressView.as_view(),
        name="addresses",
    ),

    # Single Address
    path(
        "addresses/<int:pk>/",
        AddressDetailView.as_view(),
        name="address-detail",
    ),
]