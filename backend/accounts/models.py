from django.db import models
from django.contrib.auth.models import AbstractUser


# ==========================================================
# CUSTOM USER
# ==========================================================

class User(AbstractUser):

    email = models.EmailField(
        unique=True
    )

    phone = models.CharField(
        max_length=15,
        unique=True,
        null=True,
        blank=True
    )

    profile_image = models.ImageField(
        upload_to="profile_images/",
        null=True,
        blank=True
    )

    is_email_verified = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.username


# ==========================================================
# ADDRESS
# ==========================================================

class Address(models.Model):

    HOME = "HOME"
    WORK = "WORK"
    OTHER = "OTHER"

    ADDRESS_TYPE_CHOICES = [
        (HOME, "Home"),
        (WORK, "Work"),
        (OTHER, "Other"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="addresses"
    )

    full_name = models.CharField(
        max_length=150
    )

    phone = models.CharField(
        max_length=15
    )

    address_line = models.TextField()

    city = models.CharField(
        max_length=100
    )

    state = models.CharField(
        max_length=100
    )

    pincode = models.CharField(
        max_length=10
    )

    country = models.CharField(
        max_length=100,
        default="India"
    )

    address_type = models.CharField(
        max_length=10,
        choices=ADDRESS_TYPE_CHOICES,
        default=HOME
    )

    is_default = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.full_name} - {self.city}"


# ==========================================================
# EMAIL OTP
# ==========================================================

class EmailOTP(models.Model):

    SIGNUP = "SIGNUP"
    PASSWORD_RESET = "PASSWORD_RESET"

    PURPOSE_CHOICES = [
        (SIGNUP, "Signup"),
        (PASSWORD_RESET, "Password Reset"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="email_otps"
    )

    otp_hash = models.CharField(
        max_length=128
    )

    purpose = models.CharField(
        max_length=20,
        choices=PURPOSE_CHOICES
    )

    expires_at = models.DateTimeField()

    attempts = models.PositiveIntegerField(
        default=0
    )

    is_used = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.email} - {self.purpose}"