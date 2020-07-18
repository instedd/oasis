"""Add spam column to stories

Revision ID: 2551e1a3cb06
Revises: e96755d19f0c
Create Date: 2020-07-18 06:55:03.590050

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "2551e1a3cb06"
down_revision = "e96755d19f0c"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "stories", sa.Column("spam", sa.Integer(), server_default="0")
    )


def downgrade():
    op.drop_column("stories", "spam")
