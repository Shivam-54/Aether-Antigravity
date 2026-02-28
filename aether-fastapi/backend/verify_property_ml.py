from database import SessionLocal
from models.user import User
from models.real_estate import Property
import sys

db = SessionLocal()
try:
    user = db.query(User).first() # Just grab the first user
    if not user:
        print("User not found.")
        sys.exit(1)

    properties = db.query(Property).filter(
        Property.user_id == user.id,
        Property.status != "Sold"
    ).all()

    if not properties:
        print("\n❌ 0 Active Properties Found in Database.")
        sys.exit(0)

    print(f"\n✅ Found {len(properties)} Active Property(s)\n")

    for p in properties:
        print(f"--- Property: {p.name} ---")
        errors = []
        
        # Check Name
        if not p.name or p.name.strip() == "":
             errors.append("Name is empty")
             
        # Check Purchase Price
        if not p.purchase_price or float(p.purchase_price) <= 0:
            errors.append(f"Purchase Price is missing or zero (Currently: {p.purchase_price})")
        elif float(p.purchase_price) < 100000:
             errors.append(f"Purchase Price is critically low (< ₹1L). ML models will reject this to prevent % explosion. (Currently: ₹{p.purchase_price:,.2f})")
             
        # Check Current Value
        if not p.current_value or float(p.current_value) <= 0:
            errors.append(f"Current Value is missing or zero (Currently: {p.current_value})")
        elif float(p.current_value) < 100000:
             errors.append(f"Current Value is critically low (< ₹1L). ML models will reject this. (Currently: ₹{p.current_value:,.2f})")
             
        # Check Acquisition Date
        if not p.acquisition_date:
            errors.append("Acquisition Date is missing! (The model will fallback to the date you added it to the dashboard, which ruins the historical trajectory)")
            
        print(f"Acquisition Date: {p.acquisition_date or 'MISSING'}")
        if p.purchase_price:
             print(f"Purchase Price: ₹{float(p.purchase_price):,.2f}")
        else:
             print("Purchase Price: MISSING")
        if p.current_value:
             print(f"Current Value:  ₹{float(p.current_value):,.2f}")
        else:
             print("Current Value: MISSING")
        
        if len(errors) == 0:
            print("🟢 ML STATUS: Ready - Perfect data!")
        else:
            print("🔴 ML STATUS: FAIL -> The backend will skip this property.")
            for e in errors:
                print(f"   - {e}")
        print()
            
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
