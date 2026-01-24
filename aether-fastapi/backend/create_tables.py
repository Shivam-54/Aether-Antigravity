from database import engine, Base
from models import user, real_estate, document, crypto, bonds, business

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully.")
