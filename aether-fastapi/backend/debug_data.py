import sys
import os
from sqlalchemy import text

# Add the current directory to sys.path so we can import modules
sys.path.append(os.getcwd())

from database import SessionLocal
from models.user import User
from models.real_estate import Property

def check_data():
    db = SessionLocal()
    try:
        # Check connection
        print("Checking database connection...")
        db.execute(text("SELECT 1"))
        print("Database connected.")

        # Check Users
        users = db.query(User).all()
        print(f"Total Users: {len(users)}")
        for user in users:
            print(f"User: {user.email} (ID: {user.id})")
            
            # Check Properties for user
            properties = db.query(Property).filter(Property.user_id == user.id).all()
            print(f"  Properties: {len(properties)}")
            for prop in properties:
                print(f"    - {prop.name} (Status: {prop.status})")
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_data()
