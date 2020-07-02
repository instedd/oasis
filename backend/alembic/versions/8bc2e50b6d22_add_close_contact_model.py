"""add close contact model

Revision ID: 8bc2e50b6d22
Revises: a784a61625a0
Create Date: 2020-07-02 14:43:17.466125

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "8bc2e50b6d22"
down_revision = "a784a61625a0"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "close_contacts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("story_id", sa.Integer(), nullable=True),
        sa.Column("email", sa.String(length=128), nullable=True),
        sa.Column("phone_number", sa.String(length=64), nullable=True),
        sa.ForeignKeyConstraint(["story_id"], ["stories.id"],),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_close_contacts_id"), "close_contacts", ["id"], unique=False
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_close_contacts_id"), table_name="close_contacts")
    op.drop_table("close_contacts")
    # ### end Alembic commands ###
