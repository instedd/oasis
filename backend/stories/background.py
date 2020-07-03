import datetime
from typing import List

from sqlalchemy.orm import Session

from stories import models, schemas
import sys
from emails import email_sender, contents


class ExposureNotifier:
    def __init__(
        self, contacts: List[schemas.CloseContact], story_id: int, db: Session
    ):
        self.db = db
        self.contacts = contacts
        self.notification_limit = datetime.date.today() - datetime.timedelta(
            days=4
        )
        self.story_id = story_id

    def _emails(self, notifications: List[models.ExposureNotification]):
        return [notification.email for notification in notifications]

    def _get_existing_notifications(self):
        contacts_emails = [c.email for c in self.contacts]
        db_notifications = (
            self.db.query(models.ExposureNotification)
            .filter(models.ExposureNotification.email.in_(contacts_emails))
            .all()
        )
        return db_notifications

    def _update_relationships(self):
        # All contact emails should be added to the email relationships,
        # even if it wasn't notified for it
        # (since was already notified by another)
        notifications = self._get_existing_notifications()

        already_existing_relations = [
            entry.notification_id
            for entry in (
                self.db.query(models.StoryNotification)
                .filter(models.StoryNotification.story_id == self.story_id)
                .all()
            )
        ]

        new_story_notifications = [
            models.StoryNotification(
                story_id=self.story_id, notification_id=notification.id
            )
            for notification in notifications
            if notification.id not in already_existing_relations
        ]

        self.db.add_all(new_story_notifications)
        self.db.flush()

        all_relationships = [
            r.notification_id for r in new_story_notifications
        ] + already_existing_relations

        return all_relationships

    def _update_notifications(
        self,
        notifications_to_update: List[models.ExposureNotification],
        new_emails: List[str],
    ):
        today = datetime.date.today()
        ids_to_update = [n.id for n in notifications_to_update]

        # update notified at for existing but recently notified notifications
        self.db.query(models.ExposureNotification).filter(
            models.ExposureNotification.id.in_(ids_to_update)
        ).update(
            {models.ExposureNotification.notified_at: today},
            synchronize_session="fetch",
        )
        self.db.flush()

        # create new ExposureNotifications for never-notified emails
        new_notifications = [
            models.ExposureNotification(email=email, notified_at=today)
            for email in new_emails
        ]
        self.db.add_all(new_notifications)
        self.db.flush()

    def _send_emails(self, emails: List[str]):

        for email in emails:
            email_sender.send(
                email,
                contents.EXPOSURE_NOTIFICATION_SUBJECT,
                contents.EXPOSURE_NOTIFICATION_TEXT_CONTENT,
                contents.EXPOSURE_NOTIFICATION_HTML_CONTENT,
            )

    def notify(self):
        existing_notifications = self._get_existing_notifications()
        already_notified_emails = self._emails(existing_notifications)

        updateable_notifications = [
            n
            for n in existing_notifications
            if n.notified_at < self.notification_limit
        ]

        new_emails = [
            contact.email
            for contact in self.contacts
            if contact.email not in already_notified_emails
        ]

        emails_to_notify = self._emails(updateable_notifications) + new_emails

        self._send_emails(emails_to_notify)
        self._update_notifications(updateable_notifications, new_emails)
        self._update_relationships()

        self.db.commit()
        sys.stdout.flush()
        return emails_to_notify


def send_exposure_notification(
    story: schemas.Story, contacts: List[schemas.CloseContact], db: Session
):
    notifier = ExposureNotifier(contacts, story.id, db)
    notifier.notify()
