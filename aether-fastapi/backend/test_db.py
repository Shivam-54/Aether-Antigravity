"""
Test database connection to Supabase
Run this to verify your .env configuration is correct
"""
import os
from dotenv import load_dotenv
import psycopg

# Load environment variables
load_dotenv()

def test_connection():
    """Test connection to Supabase PostgreSQL"""
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in .env file")
        return False
    
    print(f"🔌 Connecting to: {database_url[:50]}...")
    
    try:
        # Try to connect
        with psycopg.connect(database_url) as conn:
            with conn.cursor() as cur:
                # Test query
                cur.execute("SELECT version();")
                version = cur.fetchone()[0]
                print("\n✅ SUCCESS! Connected to Supabase PostgreSQL")
                print(f"📊 Database version: {version[:50]}...")
                
                # Check tables
                cur.execute("""
                    SELECT tablename 
                    FROM pg_tables 
                    WHERE schemaname = 'public'
                    LIMIT 10;
                """)
                tables = cur.fetchall()
                
                if tables:
                    print(f"\n📋 Found {len(tables)} tables in your database:")
                    for table in tables:
                        print(f"   - {table[0]}")
                else:
                    print("\n📋 No tables found in 'public' schema")
                
                print("\n🎉 Database connection test PASSED!")
                return True
                
    except Exception as e:
        print("\n❌ ERROR: Could not connect to database")
        print(f"Error: {str(e)}")
        print("\n🔧 Check your .env file:")
        print("   - Is DATABASE_URL correct?")
        print("   - Did you replace [YOUR-PASSWORD]?")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("Testing Supabase Connection")
    print("=" * 50)
    test_connection()
