import sys
import os

# Add the backend directory to the path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.supabase import get_supabase_admin
from app.core.database import SessionLocal
def promote_to_admin(email):
    supabase = get_supabase_admin()
    
    # 1. Get user by email
    # Note: supabase-py admin.list_users() is the best way
    users = supabase.auth.admin.list_users()
    target_user = next((u for u in users if u.email == email), None)
    
    if not target_user:
        print(f"Error: User with email {email} not found in Supabase.")
        return

    # 2. Update metadata to include role: ADMIN
    supabase.auth.admin.update_user_by_id(
        target_user.id,
        {"user_metadata": {"role": "ADMIN"}}
    )
    
    # 3. Log it in our DB
    db = SessionLocal()
    try:
        from app.models.admin import AuditLog
        log = AuditLog(
            action="SYSTEM_BOOTSTRAP_ADMIN",
            performed_by="SYSTEM_SCRIPT",
            details=f"Promoted {email} to ADMIN via CLI script"
        )
        db.add(log)
        db.commit()
        print(f"Successfully promoted {email} to ADMIN.")
    except Exception as e:
        print(f"Admin metadata updated, but logging failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python promote_user.py <email>")
    else:
        promote_to_admin(sys.argv[1])
