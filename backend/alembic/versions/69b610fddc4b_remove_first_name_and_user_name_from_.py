"""Remove first name and user name from users

Revision ID: 69b610fddc4b
Revises: 91a50206245d
Create Date: 2020-08-08 06:02:19.659170

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "69b610fddc4b"
down_revision = "91a50206245d"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index("username", table_name="users")
    op.drop_column("users", "first_name")
    op.drop_column("users", "username")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "users", sa.Column("username", mysql.VARCHAR(length=64), nullable=True)
    )
    op.add_column(
        "users",
        sa.Column("first_name", mysql.VARCHAR(length=128), nullable=True),
    )
    op.create_index("username", "users", ["username"], unique=True)
    # ### end Alembic commands ###