from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from django.contrib.auth import get_user_model
from django.utils import timezone

from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmailOTP, Address
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    ProfileSerializer,
    AddressSerializer,
)
from .utils import hash_otp, send_email_otp


User = get_user_model()


# ==========================================================
# REGISTER
# ==========================================================

class RegisterView(APIView):

    permission_classes = [permissions.AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.save()

            try:
                send_email_otp(
                    user,
                    EmailOTP.SIGNUP
                )

            except Exception:

                user.delete()

                return Response(
                    {
                        "detail": "Unable to send verification email. Please try again."
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            return Response(
                {
                    "detail": "Registration successful. OTP sent to your email.",
                    "email": user.email
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ==========================================================
# VERIFY EMAIL OTP
# ==========================================================

class VerifyOTPView(APIView):

    permission_classes = [permissions.AllowAny]

    def post(self, request):

        email = request.data.get(
            "email",
            ""
        ).lower().strip()

        otp = request.data.get(
            "otp",
            ""
        ).strip()

        if not email or not otp:

            return Response(
                {
                    "detail": "Email and OTP are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            user = User.objects.get(
                email=email
            )

        except User.DoesNotExist:

            return Response(
                {
                    "detail": "Invalid email or OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        otp_record = EmailOTP.objects.filter(
            user=user,
            purpose=EmailOTP.SIGNUP,
            is_used=False
        ).order_by(
            "-created_at"
        ).first()

        if not otp_record:

            return Response(
                {
                    "detail": "OTP not found. Please request a new OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if timezone.now() > otp_record.expires_at:

            otp_record.is_used = True

            otp_record.save(
                update_fields=["is_used"]
            )

            return Response(
                {
                    "detail": "OTP has expired. Please request a new OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if otp_record.attempts >= 5:

            return Response(
                {
                    "detail": "Too many incorrect attempts. Please request a new OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if hash_otp(otp) != otp_record.otp_hash:

            otp_record.attempts += 1

            otp_record.save(
                update_fields=["attempts"]
            )

            return Response(
                {
                    "detail": "Invalid OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        otp_record.is_used = True

        otp_record.save(
            update_fields=["is_used"]
        )

        user.is_email_verified = True
        user.is_active = True

        user.save(
            update_fields=[
                "is_email_verified",
                "is_active"
            ]
        )

        return Response(
            {
                "detail": "Email verified successfully. Your account is now active."
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# RESEND OTP
# ==========================================================

class ResendOTPView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def post(self, request):

        email = request.data.get(
            "email",
            ""
        ).lower().strip()

        if not email:

            return Response(
                {
                    "detail": "Email is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            user = User.objects.get(
                email=email
            )

        except User.DoesNotExist:

            return Response(
                {
                    "detail":
                    "If an eligible account exists, "
                    "a new OTP has been sent."
                },
                status=status.HTTP_200_OK
            )

        if user.is_email_verified:

            return Response(
                {
                    "detail":
                    "If an eligible account exists, "
                    "a new OTP has been sent."
                },
                status=status.HTTP_200_OK
            )

        # --------------------------------------------------
        # 60 SECOND RESEND COOLDOWN
        # --------------------------------------------------

        latest_otp = EmailOTP.objects.filter(
            user=user,
            purpose=EmailOTP.SIGNUP
        ).order_by(
            "-created_at"
        ).first()

        if latest_otp:

            elapsed = (
                timezone.now()
                - latest_otp.created_at
            ).total_seconds()

            if elapsed < 60:

                remaining = int(
                    60 - elapsed
                )

                return Response(
                    {
                        "detail":
                        f"Please wait {remaining} "
                        "seconds before requesting "
                        "another OTP."
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

        # --------------------------------------------------
        # SEND NEW OTP
        # --------------------------------------------------

        try:

            send_email_otp(
                user,
                EmailOTP.SIGNUP
            )

        except Exception:

            return Response(
                {
                    "detail":
                    "Unable to send OTP. "
                    "Please try again later."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {
                "detail":
                "A new OTP has been sent to your email."
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# FORGOT PASSWORD - SEND OTP
# ==========================================================

class ForgotPasswordView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def post(self, request):

        email = request.data.get(
            "email",
            ""
        ).lower().strip()

        if not email:

            return Response(
                {
                    "detail": "Email is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            user = User.objects.get(
                email=email
            )

        except User.DoesNotExist:

            return Response(
                {
                    "detail":
                    "If an account exists with this email, "
                    "a password reset OTP has been sent."
                },
                status=status.HTTP_200_OK
            )

        # --------------------------------------------------
        # CHECK RESEND COOLDOWN
        # --------------------------------------------------

        latest_otp = EmailOTP.objects.filter(
            user=user,
            purpose=EmailOTP.PASSWORD_RESET
        ).order_by(
            "-created_at"
        ).first()

        if latest_otp:

            elapsed = (
                timezone.now()
                - latest_otp.created_at
            ).total_seconds()

            if elapsed < 60:

                remaining = int(
                    60 - elapsed
                )

                return Response(
                    {
                        "detail":
                        f"Please wait {remaining} "
                        "seconds before requesting "
                        "another OTP."
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

        # --------------------------------------------------
        # SEND PASSWORD RESET OTP
        # --------------------------------------------------

        try:

            send_email_otp(
                user,
                EmailOTP.PASSWORD_RESET
            )

        except Exception:

            return Response(
                {
                    "detail":
                    "Unable to send OTP. "
                    "Please try again later."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {
                "detail":
                "Password reset OTP has been sent "
                "to your email."
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# VERIFY PASSWORD RESET OTP
# ==========================================================

class VerifyPasswordResetOTPView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def post(self, request):

        email = request.data.get(
            "email",
            ""
        ).lower().strip()

        otp = request.data.get(
            "otp",
            ""
        ).strip()

        if not email or not otp:

            return Response(
                {
                    "detail":
                    "Email and OTP are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            user = User.objects.get(
                email=email
            )

        except User.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Invalid email or OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        otp_record = EmailOTP.objects.filter(
            user=user,
            purpose=EmailOTP.PASSWORD_RESET,
            is_used=False
        ).order_by(
            "-created_at"
        ).first()

        if not otp_record:

            return Response(
                {
                    "detail":
                    "OTP not found. Please request a new OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # CHECK EXPIRY
        # --------------------------------------------------

        if timezone.now() > otp_record.expires_at:

            otp_record.is_used = True

            otp_record.save(
                update_fields=["is_used"]
            )

            return Response(
                {
                    "detail":
                    "OTP has expired. Please request a new OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # CHECK MAX ATTEMPTS
        # --------------------------------------------------

        if otp_record.attempts >= 5:

            return Response(
                {
                    "detail":
                    "Too many incorrect attempts. "
                    "Please request a new OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # VERIFY OTP
        # --------------------------------------------------

        if hash_otp(otp) != otp_record.otp_hash:

            otp_record.attempts += 1

            otp_record.save(
                update_fields=["attempts"]
            )

            return Response(
                {
                    "detail":
                    "Invalid OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "detail":
                "OTP verified successfully. "
                "You can now reset your password."
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# RESET PASSWORD
# ==========================================================

class ResetPasswordView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def post(self, request):

        email = request.data.get(
            "email",
            ""
        ).lower().strip()

        otp = request.data.get(
            "otp",
            ""
        ).strip()

        new_password = request.data.get(
            "new_password",
            ""
        )

        confirm_password = request.data.get(
            "confirm_password",
            ""
        )

        # --------------------------------------------------
        # REQUIRED FIELDS
        # --------------------------------------------------

        if not email or not otp:

            return Response(
                {
                    "detail":
                    "Email and OTP are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not new_password or not confirm_password:

            return Response(
                {
                    "detail":
                    "New password and confirmation "
                    "are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # PASSWORD LENGTH
        # --------------------------------------------------

        if len(new_password) < 8:

            return Response(
                {
                    "detail":
                    "Password must be at least 8 characters long."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # PASSWORD MATCH
        # --------------------------------------------------

        if new_password != confirm_password:

            return Response(
                {
                    "detail":
                    "Passwords do not match."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            user = User.objects.get(
                email=email
            )

        except User.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Invalid email or OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # GET ACTIVE RESET OTP
        # --------------------------------------------------

        otp_record = EmailOTP.objects.filter(
            user=user,
            purpose=EmailOTP.PASSWORD_RESET,
            is_used=False
        ).order_by(
            "-created_at"
        ).first()

        if not otp_record:

            return Response(
                {
                    "detail":
                    "OTP not found. Please request a new OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # CHECK EXPIRY
        # --------------------------------------------------

        if timezone.now() > otp_record.expires_at:

            otp_record.is_used = True

            otp_record.save(
                update_fields=["is_used"]
            )

            return Response(
                {
                    "detail":
                    "OTP has expired. Please request a new OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # CHECK MAX ATTEMPTS
        # --------------------------------------------------

        if otp_record.attempts >= 5:

            return Response(
                {
                    "detail":
                    "Too many incorrect attempts. "
                    "Please request a new OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # VERIFY OTP AGAIN
        # --------------------------------------------------

        if hash_otp(otp) != otp_record.otp_hash:

            otp_record.attempts += 1

            otp_record.save(
                update_fields=["attempts"]
            )

            return Response(
                {
                    "detail":
                    "Invalid OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # SET NEW PASSWORD
        # --------------------------------------------------

        user.set_password(
            new_password
        )

        user.save(
            update_fields=["password"]
        )

        # --------------------------------------------------
        # CONSUME OTP
        # --------------------------------------------------

        otp_record.is_used = True

        otp_record.save(
            update_fields=["is_used"]
        )

        return Response(
            {
                "detail":
                "Password reset successfully. "
                "You can now login with your new password."
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# CHANGE PASSWORD
# ==========================================================

class ChangePasswordView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):

        current_password = request.data.get(
            "current_password",
            ""
        )

        new_password = request.data.get(
            "new_password",
            ""
        )

        confirm_password = request.data.get(
            "confirm_password",
            ""
        )

        # --------------------------------------------------
        # REQUIRED FIELDS
        # --------------------------------------------------

        if not current_password:

            return Response(
                {
                    "detail":
                    "Current password is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not new_password:

            return Response(
                {
                    "detail":
                    "New password is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not confirm_password:

            return Response(
                {
                    "detail":
                    "Password confirmation is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # CHECK CURRENT PASSWORD
        # --------------------------------------------------

        if not request.user.check_password(
            current_password
        ):

            return Response(
                {
                    "detail":
                    "Current password is incorrect."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # PASSWORD LENGTH
        # --------------------------------------------------

        if len(new_password) < 8:

            return Response(
                {
                    "detail":
                    "New password must be at least 8 characters long."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # PASSWORD MATCH
        # --------------------------------------------------

        if new_password != confirm_password:

            return Response(
                {
                    "detail":
                    "New passwords do not match."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # SAME PASSWORD CHECK
        # --------------------------------------------------

        if current_password == new_password:

            return Response(
                {
                    "detail":
                    "New password must be different from "
                    "your current password."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # SAVE NEW PASSWORD
        # --------------------------------------------------

        request.user.set_password(
            new_password
        )

        request.user.save(
            update_fields=["password"]
        )

        return Response(
            {
                "detail":
                "Password changed successfully. "
                "Please login again."
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# LOGOUT
# ==========================================================

class LogoutView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):

        refresh_token = request.data.get(
            "refresh"
        )

        if not refresh_token:

            return Response(
                {
                    "detail":
                    "Refresh token is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            token = RefreshToken(
                refresh_token
            )

            token.blacklist()

            return Response(
                {
                    "detail":
                    "Logout successful."
                },
                status=status.HTTP_200_OK
            )

        except Exception:

            return Response(
                {
                    "detail":
                    "Invalid or expired refresh token."
                },
                status=status.HTTP_400_BAD_REQUEST
            )


# ==========================================================
# LOGIN
# ==========================================================

class LoginView(APIView):

    permission_classes = [permissions.AllowAny]

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        access_token = refresh.access_token

        return Response(
            {
                "detail": "Login successful.",

                "access": str(
                    access_token
                ),

                "refresh": str(
                    refresh
                ),

                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,

                    # Admin authorization
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,

                    # Email verification status
                    "is_email_verified":
                        user.is_email_verified,
                }
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# PROFILE
# ==========================================================

class ProfileView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):

        serializer = ProfileSerializer(
            request.user,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def patch(self, request):

        serializer = ProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={
                "request": request
            }
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ==========================================================
# ADDRESS
# ==========================================================

class AddressView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    # ------------------------------------------------------
    # GET - List user's addresses
    # ------------------------------------------------------

    def get(self, request):

        addresses = Address.objects.filter(
            user=request.user
        ).order_by(
            "-is_default",
            "-created_at"
        )

        serializer = AddressSerializer(
            addresses,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # ------------------------------------------------------
    # POST - Add new address
    # ------------------------------------------------------

    def post(self, request):

        serializer = AddressSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        is_default = serializer.validated_data.get(
            "is_default",
            False
        )

        # If this is the first address,
        # automatically make it default.

        if not Address.objects.filter(
            user=request.user
        ).exists():

            is_default = True

        # If new address is default,
        # remove default from old addresses.

        if is_default:

            Address.objects.filter(
                user=request.user,
                is_default=True
            ).update(
                is_default=False
            )

        address = serializer.save(
            user=request.user,
            is_default=is_default
        )

        return Response(
            AddressSerializer(address).data,
            status=status.HTTP_201_CREATED
        )


# ==========================================================
# ADDRESS DETAIL
# ==========================================================

class AddressDetailView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    # ------------------------------------------------------
    # Find address belonging to current user
    # ------------------------------------------------------

    def get_address(self, request, pk):

        try:

            return Address.objects.get(
                id=pk,
                user=request.user
            )

        except Address.DoesNotExist:

            return None

    # ------------------------------------------------------
    # GET single address
    # ------------------------------------------------------

    def get(self, request, pk):

        address = self.get_address(
            request,
            pk
        )

        if not address:

            return Response(
                {
                    "detail": "Address not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AddressSerializer(
            address
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # ------------------------------------------------------
    # PATCH - Update address
    # ------------------------------------------------------

    def patch(self, request, pk):

        address = self.get_address(
            request,
            pk
        )

        if not address:

            return Response(
                {
                    "detail": "Address not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AddressSerializer(
            address,
            data=request.data,
            partial=True
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        is_default = serializer.validated_data.get(
            "is_default",
            address.is_default
        )

        if is_default:

            Address.objects.filter(
                user=request.user,
                is_default=True
            ).exclude(
                id=address.id
            ).update(
                is_default=False
            )

        serializer.save(
            is_default=is_default
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # ------------------------------------------------------
    # DELETE - Delete address
    # ------------------------------------------------------

    def delete(self, request, pk):

        address = self.get_address(
            request,
            pk
        )

        if not address:

            return Response(
                {
                    "detail": "Address not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        was_default = address.is_default

        address.delete()

        # If deleted address was default,
        # make another address default.

        if was_default:

            next_address = Address.objects.filter(
                user=request.user
            ).order_by(
                "-created_at"
            ).first()

            if next_address:

                next_address.is_default = True

                next_address.save(
                    update_fields=["is_default"]
                )

        return Response(
            {
                "detail": "Address deleted successfully."
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# ADMIN PERMISSION
# ==========================================================

class IsAdminUser(permissions.BasePermission):

    def has_permission(self, request, view):

        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


# ==========================================================
# ADMIN PROFILE
# ==========================================================

class AdminProfileView(APIView):

    permission_classes = [
        IsAdminUser
    ]

    def get(self, request):

        return Response(
            {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
                "phone": request.user.phone,
                "is_staff": request.user.is_staff,
                "is_superuser": request.user.is_superuser,
                "is_email_verified":
                    request.user.is_email_verified,
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# ADMIN CUSTOMERS
# ==========================================================

class AdminCustomersView(APIView):

    permission_classes = [
        IsAdminUser
    ]

    def get(self, request):

        from django.db.models import Q

        customers = User.objects.filter(
            is_staff=False,
            is_superuser=False
        ).order_by(
            "-date_joined"
        )

        # --------------------------------------------------
        # SEARCH
        # --------------------------------------------------

        search = request.query_params.get(
            "search",
            ""
        ).strip()

        if search:

            customers = customers.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(phone__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )

        # --------------------------------------------------
        # CUSTOMER RESPONSE
        # --------------------------------------------------

        data = []

        for customer in customers:

            profile_image = None

            if customer.profile_image:

                profile_image = request.build_absolute_uri(
                    customer.profile_image.url
                )

            data.append(
                {
                    "id": customer.id,
                    "username": customer.username,
                    "email": customer.email,
                    "phone": customer.phone,
                    "first_name": customer.first_name,
                    "last_name": customer.last_name,

                    # Profile image
                    "profile_image": profile_image,

                    "is_active": customer.is_active,
                    "is_email_verified":
                        customer.is_email_verified,
                    "date_joined": customer.date_joined,
                    "last_login": customer.last_login,
                }
            )

        return Response(
            data,
            status=status.HTTP_200_OK
        )


# ==========================================================
# ADMIN CUSTOMER DETAIL
# ==========================================================

class AdminCustomerDetailView(APIView):

    permission_classes = [
        IsAdminUser
    ]

    def get(self, request, pk):

        # --------------------------------------------------
        # GET CUSTOMER
        # --------------------------------------------------

        try:

            customer = User.objects.get(
                id=pk,
                is_staff=False,
                is_superuser=False
            )

        except User.DoesNotExist:

            return Response(
                {
                    "detail": "Customer not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # --------------------------------------------------
        # PROFILE IMAGE
        # --------------------------------------------------

        profile_image = None

        if customer.profile_image:

            profile_image = request.build_absolute_uri(
                customer.profile_image.url
            )

        # --------------------------------------------------
        # GET DEFAULT ADDRESS
        # --------------------------------------------------

        address = Address.objects.filter(
            user=customer,
            is_default=True
        ).first()

        # If default address does not exist,
        # get the latest address.

        if not address:

            address = Address.objects.filter(
                user=customer
            ).order_by(
                "-created_at"
            ).first()

        # --------------------------------------------------
        # ADDRESS DATA
        # --------------------------------------------------

        address_data = None

        if address:

            address_data = {
                "id": address.id,
                "full_name": address.full_name,
                "phone": address.phone,
                "address_line": address.address_line,
                "city": address.city,
                "state": address.state,
                "pincode": address.pincode,
                "country": address.country,
                "address_type": address.address_type,
                "is_default": address.is_default,
            }

        # --------------------------------------------------
        # CUSTOMER DETAIL RESPONSE
        # --------------------------------------------------

        return Response(
            {
                "id": customer.id,
                "username": customer.username,
                "email": customer.email,
                "phone": customer.phone,
                "first_name": customer.first_name,
                "last_name": customer.last_name,

                # Profile image URL
                "profile_image": profile_image,

                "is_active": customer.is_active,
                "is_email_verified":
                    customer.is_email_verified,

                "date_joined": customer.date_joined,
                "last_login": customer.last_login,

                "address": address_data,
            },
            status=status.HTTP_200_OK
        )