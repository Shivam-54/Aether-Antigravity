from database import SessionLocal
from models.real_estate import Property
import traceback

db = SessionLocal()
try:
    prop = db.query(Property).filter(Property.id == '31ea61d1-d545-4bd7-a607-df2e39f2a6fb').first()
    if prop:
        print(f"Found property: {prop.name}")
        db.delete(prop)
        db.commit()
        print("Successfully deleted!")
    else:
        print("Property not found")
except Exception as e:
    print("ERROR DELETING:")
    traceback.print_exc()
finally:
    db.close()
