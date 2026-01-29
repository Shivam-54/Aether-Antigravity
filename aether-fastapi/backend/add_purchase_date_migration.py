"""
Add purchase_date column to crypto_holdings table

Run this with:
python add_purchase_date_migration.py
"""

from database import get_db
from sqlalchemy import text

def run_migration():
    db = next(get_db())
    
    try:
        # Check if column exists
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='crypto_holdings' AND column_name='purchase_date';
        """)
        
        result = db.execute(check_query).fetchone()
        
        if result:
            print("✅ Column 'purchase_date' already exists!")
            return
        
        # Add the column
        migration_query = text("""
            ALTER TABLE crypto_holdings 
            ADD COLUMN purchase_date DATE NULL;
        """)
        
        db.execute(migration_query)
        db.commit()
        
        print("✅ Successfully added 'purchase_date' column to crypto_holdings table!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error running migration: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
