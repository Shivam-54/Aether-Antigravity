# Aether - Portfolio Management System

Modern portfolio management application built with FastAPI, HTML/Bootstrap, and Supabase.

## Tech Stack

- **Backend**: Python 3.10+ with FastAPI
- **Frontend**: HTML5, Bootstrap 5, Vanilla JavaScript
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT tokens
- **ML (Future)**: scikit-learn, TensorFlow, pandas

## Project Structure

```
aether-fastapi/
├── backend/              # FastAPI application
│   ├── main.py          # FastAPI app entry point
│   ├── config.py        # Configuration
│   ├── database.py      # Database connection
│   ├── requirements.txt # Python dependencies
│   ├── models/          # SQLAlchemy models
│   ├── routes/          # API endpoints
│   └── ml/              # ML models (future)
│
└── frontend/            # HTML/CSS/JS
    ├── index.html       # Landing page
    ├── css/             # Stylesheets
    ├── js/              # JavaScript files
    └── assets/          # Images, icons
```

## Setup Instructions

### 1. Backend Setup

```bash
cd aether-fastapi/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 2. Configure Database

1. Go to your Supabase dashboard
2. Navigate to Settings → Database
3. Copy the Connection String (URI format)
4. Paste it in `.env` as `DATABASE_URL`

### 3. Run Backend

```bash
# From backend/ directory
python main.py

# Or use uvicorn directly:
uvicorn main:app --reload
```

Backend will run at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### 4. Frontend

Simply open `frontend/index.html` in your browser, or use a local server:

```bash
# Python simple server (from frontend/ directory)
python -m http.server 3000

# Or use VS Code Live Server extension
```

Frontend will run at: `http://localhost:3000`

## Development Workflow

1. **Backend Development**: Edit files in `backend/`, server auto-reloads
2. **Frontend Development**: Edit HTML/CSS/JS, refresh browser
3. **Test API**: Use FastAPI docs at `/docs` or tools like Postman

## Next Steps

- [ ] Set up Supabase connection
- [ ] Create User model and authentication
- [ ] Build dashboard
- [ ] Add stocks module
- [ ] Add crypto module
- [ ] Integrate ML features

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Bootstrap Documentation](https://getbootstrap.com/)
- [Supabase Documentation](https://supabase.com/docs)

---

Built with ❤️ for AI/ML internship showcase
