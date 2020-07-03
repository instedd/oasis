import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def get_env(key):
    return os.environ[key] if not IS_DEV else ""


IS_DEV = os.environ.get("DEV", False)
SENDER = get_env("SMTP_FROM_ADDRESS")
USERNAME_SMTP = get_env("SMTP_USER")
PASSWORD_SMTP = get_env("SMTP_PASS")
HOST = get_env("SMTP_SERVER")
PORT = get_env("SMTP_PORT")


def send(to: str, subject: str, body_text: str, body_html: str = None):

    # Create message container
    msg = MIMEMultipart("alternative")
    msg["From"] = SENDER
    msg["To"] = to
    msg["Subject"] = subject

    # Record the MIME types of both parts - text/plain and text/html.
    part1 = MIMEText(body_text, "plain")
    part2 = MIMEText(body_html, "html")

    # Attach parts into message container.
    # According to RFC 2046, the last part of a multipart message, in this case
    # the HTML message, is best and preferred.
    msg.attach(part1)
    msg.attach(part2)

    # Try to send the message.
    try:
        if not IS_DEV:
            server = smtplib.SMTP(HOST, PORT)
            server.ehlo()
            server.starttls()
            # stmplib docs recommend calling ehlo() before & after starttls()
            server.ehlo()
            server.login(USERNAME_SMTP, PASSWORD_SMTP)
            server.sendmail(SENDER, to, msg.as_string())
            server.close()
        else:
            print(msg.as_string())
    # Display an error message if something goes wrong.
    except Exception as e:
        print("Error: ", e)
