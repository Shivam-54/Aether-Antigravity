from database import engine, Base, SessionLocal
from models.business import Business, BusinessTransaction
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def recreate_business_table():
    logger.info("Starting recreation of 'businesses' table...")
    
    # Create a session to ensure no locks are held
    db = SessionLocal()
    try:
        # Drop the table
        # Note: We need to drop BusinessTransaction first because it depends on Business
        logger.info("Dropping 'business_transactions' table if exists...")
        BusinessTransaction.__table__.drop(engine, checkfirst=True)
        
        logger.info("Dropping 'businesses' table if exists...")
        Business.__table__.drop(engine, checkfirst=True)
        
        # Create the table
        logger.info("Creating 'businesses' and 'business_transactions' tables with new schema...")
        Business.__table__.create(engine)
        BusinessTransaction.__table__.create(engine)
        
        logger.info("Successfully recreated tables with updated schema.")
        
    except Exception as e:
        logger.error(f"Error recreating table: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    recreate_business_table()
