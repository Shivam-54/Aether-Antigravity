# How to Start Aether (Step-by-Step Guide)

This is the exact sequence of commands you need to type into your Mac Terminal to start the Aether project for your GTU review.

## Step 1: Open Terminal
1. Press `Command (⌘)` + `Spacebar` to open Spotlight Search.
2. Type `Terminal` and press `Enter`. 

---

## Step 2: Navigate to the Backend Folder
You need to tell the terminal to go into the folder where all the Python code lives.

**Type this EXACTLY and press Enter:**
```bash
cd /Users/shivampatel/aether-isle/aether-fastapi/backend
```

*(You won't see any output message, but your terminal line should now show `backend`)*

---

## Step 3: Start the Python Backend Server
Now you need to turn on the virtual environment (which holds your ML libraries) and start the FastAPI server.

**Type this EXACTLY and press Enter:**
```bash
source venv/bin/activate && ./start_dev.sh
```

### 👉 What the Output WILL Look Like:
If you did it correctly, your terminal will print out a bunch of lines that look like this:
```text
🔄 Clearing port 8000...
🚀 Starting Aether (dev, hot-reload)...
INFO:     Will watch for changes in these directories: ['/Users/shivampatel/aether-isle/aether-fastapi/backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
Importing plotly failed. Interactive plots will not work.
LSTM Predictor initialized on device: cpu
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```
*(The "Importing plotly" and "LSTM" lines are normal — ignore them. Leave this terminal window OPEN!)*

---

## Step 4: Open a NEW Terminal Tab for the Frontend
Your backend is running. Now we need to start the website part. 
1. In your Terminal, press **`Command (⌘)` + `T`**. This opens a brand new, clean tab next to your running backend.

---

## Step 5: Navigate to the Frontend Folder
In this new tab, we need to go to the folder where your HTML and JavaScript files live.

**Type this EXACTLY and press Enter:**
```bash
cd /Users/shivampatel/aether-isle/aether-fastapi/frontend
```

---

## Step 6: Start the Frontend Web Server
Now we turn on the simple web server that serves your dashboard to the browser.

**Type this EXACTLY and press Enter:**
```bash
python3 -m http.server 3000
```

### 👉 What the Output WILL Look Like:
If you did it correctly, your terminal will instantly print *only one line*:
```text
Serving HTTP on :: port 3000 (http://[::]:3000/) ...
```
*(Leave this terminal tab OPEN as well!)*

---

## Troubleshooting: "Address already in use" Error
If you get an error that says `OSError: [Errno 48] Address already in use` when trying to start the frontend server, it means another process (likely a previous run of the frontend) is still running in the background.

**To fix this, type this EXACTLY and press Enter:**
```bash
lsof -ti :3000 | xargs kill -9
```
*(This command finds whatever is using port 3000 and forcefully quits it. You won't see any confirmation message, but the port will be freed.)*

After running that command, try Step 6 again:
```bash
python3 -m http.server 3000
```

---

## Step 7: Open the Website in Chrome/Safari
Both of your servers are now running! 
1. Open Google Chrome or Safari.
2. Click the top address bar.
3. Type: `http://localhost:3000/dashboard.html` and press Enter.

The Aether Dashboard will immediately load on your screen.

---

### How to STOP the project when the review is over:
1. Go to your terminal tab.
2. Press **`Control` + `C`**. This instantly kills the server.
3. Close the terminal window.