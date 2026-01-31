import os
import sqlalchemy
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load .env explicitly
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL").replace("postgresql://", "postgresql+psycopg://")

def migrate():
    print(f"Connecting to database...")
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as connection:
            print("Attempting to add 'description' column to 'documents' table...")
            try:
                connection.execute(text("ALTER TABLE documents ADD COLUMN description TEXT;"))
                connection.commit()
                print("✅ Successfully added 'description' column.")
            except Exception as e:
                # Check for "duplicate column" error which means it already exists
                if "already exists" in str(e).lower():
                    print("ℹ️ Column 'description' already exists. No changes needed.")
                else:
                    print(f"❌ Error adding column: {e}")
                    raise e
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

if __name__ == "__main__":
    migrate()
