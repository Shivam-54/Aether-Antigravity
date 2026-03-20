import sqlite3

# Connect to the SQLite database
conn = sqlite3.connect('/Users/shivampatel/aether-isle/aether-fastapi/backend/aether.db')
cursor = conn.cursor()

# Get the count of shares
try:
    cursor.execute("SELECT COUNT(*) FROM shares")
    count = cursor.fetchone()[0]
    print(f"Total shares in database: {count}")
    
    if count > 0:
        cursor.execute("SELECT id, user_id, symbol, company_name FROM shares LIMIT 5")
        rows = cursor.fetchall()
        print("Sample shares:")
        for r in rows:
            print(r)
            
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count = cursor.fetchone()[0]
    print(f"Total users in database: {user_count}")
    
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
