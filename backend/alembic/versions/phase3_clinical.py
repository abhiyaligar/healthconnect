"""add clinical fields and records

Revision ID: phase3_clinical
Revises: phase2_profiles
Create Date: 2026-05-05

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'phase3_clinical'
down_revision = 'phase2_profiles'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Update Appointments
    op.add_column('appointments', sa.Column('clinical_notes', sa.Text(), nullable=True))
    op.add_column('appointments', sa.Column('diagnosis', sa.Text(), nullable=True))

    # 2. Update Patient Profile
    op.add_column('patient_profiles', sa.Column('full_name', sa.String(), nullable=True))

    # 3. Create medical_records table
    op.create_table('medical_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('appointment_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('doctor_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('file_url', sa.String(), nullable=False),
        sa.Column('file_type', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['appointment_id'], ['appointments.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('medical_records')
    op.drop_column('patient_profiles', 'full_name')
    op.drop_column('appointments', 'diagnosis')
    op.drop_column('appointments', 'clinical_notes')
