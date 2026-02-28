import random
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import SessionLocal
from models.real_estate import Property
from models.property_valuation import PropertyValuation
from models.user import User

db = SessionLocal()

try:
    # 1. Get the admin user
    user = db.query(User).filter(User.email == "shivamp054@gmail.com").first()
    if not user:
        print("User not found!")
        exit()

    # 2. Basic Details
    start_date = date(1991, 1, 1) # ~35 years ago
    purchase_price = 0.18 # 18 Lakhs
    current_val = 5.00 # 5 Crores
    total_months = 35 * 12

    # 3. Create Property
    prop = Property(
        name="Katargam Land Plot",
        type="Land",
        status="Owned",
        purchase_price=purchase_price,
        current_value=current_val,
        location="Surat, Gujarat",
        address="Katargam Main Road, Surat",
        acquisition_date=start_date,
        description="Prime location plot in Katargam, bought 35 years ago.",
        ownership_structure="Individual",
        user_id=user.id
    )
    db.add(prop)
    db.commit()
    db.refresh(prop)
    print(f"Created Property '{prop.name}' with ID: {prop.id}")

    # 4. Generate 420 Months of Realistic Appreciation Data
    # We want it to grow exponentially from 0.18 to 5.00 over 420 months.
    monthly_growth_rate = ((current_val / purchase_price) ** (1 / total_months)) - 1
    print(f"Monthly Growth Rate: {monthly_growth_rate*100:.4f}%")
    
    valuations = []
    current_simulated_value = purchase_price
    
    for i in range(total_months + 1):
        eval_date = start_date + relativedelta(months=i)
        
        # Add some random market noise (-2% to +2.5%) for realism
        noise = random.uniform(-0.02, 0.025)
        
        # Calculate new value
        if i > 0:
            current_simulated_value = current_simulated_value * (1 + monthly_growth_rate + noise)
        
        # Ensure it doesn't drop below purchase price artificially at the start
        current_simulated_value = max(purchase_price, current_simulated_value)
        
        # Force the exact final value at the exact last month
        if i == total_months:
             current_simulated_value = current_val

        v = PropertyValuation(
            property_id=prop.id,
            valuation_date=eval_date,
            value=round(current_simulated_value, 4),
            source="Historical Simulation"
        )
        valuations.append(v)

    # Bulk Insert
    db.bulk_save_objects(valuations)
    db.commit()
    print(f"Successfully generated {len(valuations)} months of historical data for Katargam!")

except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
