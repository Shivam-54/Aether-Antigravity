from datetime import datetime
from database import SessionLocal
from models.real_estate import Property
from models.property_valuation import PropertyValuation
import sys

db = SessionLocal()
try:
    prop_id = "82e632f9-3dc1-4a94-b65e-a085179734b6"
    
    prop = db.query(Property).filter(Property.id == prop_id).first()
    if not prop:
        print("Property not found by UUID.")
        sys.exit(1)

    print(f"Adding data to Property: {prop.name}")

    # Delete existing valuations testing to avoid duplicates
    db.query(PropertyValuation).filter(PropertyValuation.property_id == prop.id).delete()
    
    historical_data = [
        {"date": "1992-02-14", "value": 110000},
        {"date": "1995-10-23", "value": 160000},
        {"date": "2000-03-08", "value": 360000},
        {"date": "2004-06-17", "value": 800000},
        {"date": "2005-11-05", "value": 1100000},
        {"date": "2008-01-21", "value": 1800000},
        {"date": "2010-09-12", "value": 2500000},
        {"date": "2014-05-04", "value": 7000000},
        {"date": "2016-08-29", "value": 9000000},
        {"date": "2019-02-11", "value": 13000000},
        {"date": "2020-07-30", "value": 16000000},
        {"date": "2021-04-18", "value": 21000000},
        {"date": "2022-11-09", "value": 26000000},
        {"date": "2023-01-22", "value": 32000000},
        {"date": "2024-10-07", "value": 39000000},
        {"date": "2025-05-14", "value": 46000000},
        {"date": "2026-01-20", "value": 56000000}
    ]

    valuations = []
    for entry in historical_data:
        v = PropertyValuation(
            property_id=prop.id,
            user_id=prop.user_id,  # ADDED EXPLICIT USER_ID
            valuation_date=datetime.strptime(entry["date"], "%Y-%m-%d").date(),
            value=entry["value"],
            source="Historical Record"
        )
        valuations.append(v)

    db.bulk_save_objects(valuations)
    
    # OVERWRITE Current Price to the requested latest
    prop.current_value = 56000000
    prop.purchase_price = 110000
    prop.acquisition_date = datetime.strptime("1992-02-14", "%Y-%m-%d").date()

    db.commit()
    print(f"Successfully inserted {len(valuations)} entries!")

except Exception as e:
    db.rollback()
    print(f"Error: {e}")
finally:
    db.close()
