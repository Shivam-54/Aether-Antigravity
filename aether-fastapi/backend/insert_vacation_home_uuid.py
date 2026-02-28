from datetime import datetime
import random
from database import SessionLocal
from models.real_estate import Property
from models.property_valuation import PropertyValuation
import sys

db = SessionLocal()
try:
    prop_id = "0900c8c5-a0ad-487d-94c0-6145eab143df" # Vacation Home
    
    prop = db.query(Property).filter(Property.id == prop_id).first()
    if not prop:
        print("Property not found by UUID.")
        sys.exit(1)

    print(f"Adding data to Property: {prop.name}")

    # Delete existing valuations to avoid duplicates
    db.query(PropertyValuation).filter(PropertyValuation.property_id == prop.id).delete()

    raw_data = [
        (1990, 350000), (1992, 450000), (1994, 620000), (1996, 850000),
        (1998, 1080000), (2000, 1250000), (2002, 1600000), (2004, 2400000),
        (2006, 3500000), (2008, 4800000), (2010, 6000000), (2012, 7800000),
        (2014, 9800000), (2016, 12500000), (2018, 15500000), (2020, 18500000),
        (2021, 21000000), (2022, 24000000), (2023, 26500000), (2024, 29500000),
        (2025, 32000000), (2026, 35000000)
    ]

    valuations = []
    for year, value in raw_data:
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        
        if year == 1990:
            date_str = "1990-06-13" # Match the screenshot purchase date
        elif year == 2026:
            # ensure 2026 is a recent date for current_value consistency
            date_str = "2026-02-15"
        else:
            date_str = f"{year}-{month:02d}-{day:02d}"

        v = PropertyValuation(
            property_id=prop.id,
            user_id=prop.user_id,
            valuation_date=datetime.strptime(date_str, "%Y-%m-%d").date(),
            value=value,
            source="Historical Record"
        )
        valuations.append(v)

    db.bulk_save_objects(valuations)
    
    # Update Current Price to the latest (2026 value)
    prop.current_value = 35000000
    prop.purchase_price = 350000
    prop.acquisition_date = datetime.strptime("1990-06-13", "%Y-%m-%d").date()

    db.commit()
    print(f"Successfully inserted {len(valuations)} entries for {prop.name}!")

except Exception as e:
    db.rollback()
    print(f"Error: {e}")
finally:
    db.close()
