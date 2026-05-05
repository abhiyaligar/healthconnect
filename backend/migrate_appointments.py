from sqlalchemy import text
from app.core.database import engine

def migrate():
    with engine.connect() as conn:
        print("Adding reschedule_count to appointments...")
        try:
            conn.execute(text("ALTER TABLE appointments ADD COLUMN reschedule_count INTEGER DEFAULT 0;"))
            conn.commit()
            print("Successfully added reschedule_count.")
        except Exception as e:
            print(f"Error adding reschedule_count: {e}")
            
        print("Adding wait_start_time to appointments...")
        try:
            conn.execute(text("ALTER TABLE appointments ADD COLUMN wait_start_time TIMESTAMPTZ;"))
            conn.commit()
            print("Successfully added wait_start_time.")
        except Exception as e:
            print(f"Error adding wait_start_time: {e}")

if __name__ == "__main__":
    migrate()
