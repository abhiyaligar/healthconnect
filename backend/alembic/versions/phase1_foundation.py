"""create slot and appointment tables

Revision ID: phase1_foundation
Revises: 
Create Date: 2026-05-05

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'phase1_foundation'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table('slots',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('doctor_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('max_capacity', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('appointments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('slot_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('queue_token', sa.String(), nullable=True),
        sa.Column('priority_score', sa.Integer(), nullable=True),
        sa.Column('actual_start_time', sa.DateTime(timezone=True), nullable=True),
        sa.Column('actual_end_time', sa.DateTime(timezone=True), nullable=True),
        sa.Column('consultation_duration', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['slot_id'], ['slots.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('queue_token')
    )

def downgrade() -> None:
    op.drop_table('appointments')
    op.drop_table('slots')
