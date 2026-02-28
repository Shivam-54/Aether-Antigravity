from database import SessionLocal
from models.real_estate import Property

db = SessionLocal()
try:
    props = db.query(Property).all()
    print(f"Total properties: {len(props)}")
    for p in props:
        print(f"ID: {p.id} | Name: '{p.name}' | Type: {p.type}")
        
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
