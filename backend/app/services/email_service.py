import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import get_settings
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def _send_email(to_email: str, subject: str, body_html: str):
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning("SMTP credentials not configured. Skipping email.")
            return

        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        message["To"] = to_email

        html_part = MIMEText(body_html, "html")
        message.attach(html_part)

        try:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM_EMAIL, to_email, message.as_string())
            logger.info(f"Email sent successfully to {to_email}")
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")

    @classmethod
    def send_verification_email(cls, email: str, code: str):
        subject = f"{code} is your HealthConnect verification code"
        body = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #006382;">Welcome to HealthConnect</h2>
            <p>Please use the following verification code to complete your signup:</p>
            <div style="background: #f4f7f9; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #006382; letter-spacing: 5px; border-radius: 8px;">
                {code}
            </div>
            <p style="color: #555; font-size: 14px; margin-top: 20px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
        """
        cls._send_email(email, subject, body)

    @classmethod
    def send_password_reset_email(cls, email: str, link: str):
        subject = "Reset your HealthConnect password"
        body = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #006382;">Password Reset Request</h2>
            <p>We received a request to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{link}" style="background: #006382; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #555; font-size: 14px;">Alternatively, copy and paste this link into your browser:</p>
            <p style="color: #006382; font-size: 12px;">{link}</p>
        </div>
        """
        cls._send_email(email, subject, body)

    @classmethod
    def send_appointment_confirmation(cls, email: str, details: dict):
        subject = f"Confirmed: Appointment with {details['doctor_name']}"
        body = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #008060;">Appointment Confirmed</h2>
            <p>Your appointment has been successfully booked.</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #008060;">
                <p><strong>Doctor:</strong> {details['doctor_name']}</p>
                <p><strong>Date:</strong> {details['date']}</p>
                <p><strong>Time:</strong> {details['time']}</p>
                <p><strong>Token:</strong> {details['token']}</p>
            </div>
            <p style="margin-top: 20px;">Please arrive 15 minutes early. Thank you for choosing HealthConnect.</p>
        </div>
        """
        cls._send_email(email, subject, body)

    @classmethod
    def send_appointment_cancellation(cls, email: str, details: dict):
        subject = f"Cancelled: Appointment with {details['doctor_name']}"
        body = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ba1a1a;">Appointment Cancelled</h2>
            <p>Your appointment on <strong>{details['date']}</strong> at <strong>{details['time']}</strong> has been cancelled.</p>
            <p>Reason: {details.get('reason', 'N/A')}</p>
            <p style="margin-top: 20px;">You can book a new appointment via the dashboard at any time.</p>
        </div>
        """
        cls._send_email(email, subject, body)

    @classmethod
    def send_emergency_reschedule(cls, email: str, details: dict):
        subject = "EMERGENCY: Your appointment has been rescheduled"
        body = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; border: 2px solid #ba1a1a;">
            <h2 style="color: #ba1a1a;">Important Schedule Update</h2>
            <p>Due to sudden doctor unavailability, your appointment has been rescheduled to ensure you are still seen as soon as possible.</p>
            <div style="background: #fff5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #ba1a1a;">
                <p style="text-decoration: line-through; color: #777;">Original Time: {details['old_time']}</p>
                <p style="font-size: 18px; font-weight: bold; color: #ba1a1a;">New Time: {details['new_time']}</p>
                <p><strong>Doctor:</strong> {details['doctor_name']}</p>
                <p><strong>Date:</strong> {details['date']}</p>
            </div>
            <p style="margin-top: 20px;">We apologize for this unexpected change. Please arrive at the new time.</p>
        </div>
        """
        cls._send_email(email, subject, body)

    @classmethod
    def send_turn_arrival_notification(cls, email: str, details: dict):
        subject = f'Your Turn: Please visit {details["doctor_name"]}'
        body = f'''
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; border: 2px solid #006382;">
            <h2 style="color: #006382;">Your Turn Has Arrived!</h2>
            <p>Hello,</p>
            <p>The doctor is ready to see you now. Please proceed to the consultation room immediately.</p>
            <div style="background: #f0f4f8; padding: 20px; border-radius: 8px; border-left: 4px solid #006382;">
                <p><strong>Doctor:</strong> {details['doctor_name']}</p>
                <p><strong>Location:</strong> Main Clinical Wing, Room {details.get('room', '101')}</p>
            </div>
            <p style="margin-top: 20px; color: #555;">If you are not at the clinic yet, please hurry. Thank you!</p>
        </div>
        '''
        cls._send_email(email, subject, body)
