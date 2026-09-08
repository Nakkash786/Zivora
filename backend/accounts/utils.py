import hashlib
import secrets

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta

from .models import EmailOTP


OTP_EXPIRY_MINUTES = 5


def generate_otp():
    return f"{secrets.randbelow(1000000):06d}"


def hash_otp(otp):
    return hashlib.sha256(
        otp.encode("utf-8")
    ).hexdigest()


def send_email_otp(user, purpose):

    otp = generate_otp()
    otp_hash = hash_otp(otp)

    EmailOTP.objects.filter(
        user=user,
        purpose=purpose,
        is_used=False
    ).update(is_used=True)

    EmailOTP.objects.create(
        user=user,
        otp_hash=otp_hash,
        purpose=purpose,
        expires_at=timezone.now()
        + timedelta(minutes=OTP_EXPIRY_MINUTES)
    )

    subject = "Zivora Email Verification OTP"

    message = f"""
Hello {user.first_name or user.username},

Your Zivora verification OTP is:

{otp}

This OTP is valid for 5 minutes.

If you did not request this OTP, please ignore this email.

Regards,
Zivora Team
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )