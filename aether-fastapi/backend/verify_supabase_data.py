"""
Verify that crypto holdings are stored in Supabase database

Run this with:
python verify_supabase_data.py
"""

from database import get_db
from sqlalchemy import text

def verify_crypto_holdings():
    db = next(get_db())
    
    try:
        # Check database connection
        print("🔍 Checking Supabase connection...")
        connection_check = text("SELECT version();")
        result = db.execute(connection_check).fetchone()
        print(f"✅ Connected to: {result[0]}\n")
        
        # Check if crypto_holdings table exists
        print("🔍 Checking crypto_holdings table...")
        table_check = text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'crypto_holdings'
            );
        """)
        exists = db.execute(table_check).fetchone()[0]
        
        if not exists:
            print("❌ Table 'crypto_holdings' does not exist!")
            return
        
        print("✅ Table 'crypto_holdings' exists\n")
        
        # Check table structure
        print("📋 Table structure:")
        structure_query = text("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'crypto_holdings'
            ORDER BY ordinal_position;
        """)
        
        columns = db.execute(structure_query).fetchall()
        for col in columns:
            nullable = "NULL" if col[2] == "YES" else "NOT NULL"
            print(f"  - {col[0]:<25} {col[1]:<20} {nullable}")
        
        print()
        
        # Count total holdings
        count_query = text("SELECT COUNT(*) FROM crypto_holdings;")
        total_count = db.execute(count_query).fetchone()[0]
        print(f"📊 Total holdings in database: {total_count}")
        
        if total_count > 0:
            # Show recent holdings
            print("\n📦 Recent holdings (last 5):")
            recent_query = text("""
                SELECT 
                    symbol, 
                    name, 
                    quantity, 
                    purchase_price_avg,
                    purchase_date,
                    wallet_id,
                    created_at
                FROM crypto_holdings
                ORDER BY created_at DESC
                LIMIT 5;
            """)
            
            holdings = db.execute(recent_query).fetchall()
            for h in holdings:
                wallet_text = f"Wallet: {h[5]}" if h[5] else "No wallet"
                purchase_date_text = f"Purchased: {h[4]}" if h[4] else "No purchase date"
                print(f"\n  🪙 {h[0]} ({h[1]})")
                print(f"     Quantity: {h[2]} | Avg Price: ₹{h[3]:,.2f}")
                print(f"     {wallet_text} | {purchase_date_text}")
                print(f"     Created: {h[6]}")
        
        print("\n✅ Supabase verification complete!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    verify_crypto_holdings()
