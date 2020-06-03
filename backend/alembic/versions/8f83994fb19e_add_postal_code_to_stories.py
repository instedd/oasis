"""Add postal code to stories

Revision ID: 8f83994fb19e
Revises: 6b6c492a6041
Create Date: 2020-06-03 20:16:57.317772

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "8f83994fb19e"
down_revision = "6b6c492a6041"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "stories",
        sa.Column("postal_code", sa.String(length=64), nullable=True),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("stories", "postal_code")
    # ### end Alembic commands ###
