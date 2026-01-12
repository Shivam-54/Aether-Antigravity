# n8n Workflow Setup Guide

## Quick Import Steps

1. **Open n8n** in your browser
2. Click **"Add workflow"** (or the **+** button)
3. Click the **three dots** (⋮) in the top right
4. Select **"Import from File"**
5. Choose the file: `aether-chatbot-workflow.json`
6. Click **Import**

## Configure the Workflow

### Step 1: Set Up Gemini API Key
1. In n8n, go to **Settings** → **Environments**
2. Add a new environment variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Google Gemini API key (from `.env.local`)

### Step 2: Activate the Webhook
1. Click on the **"Webhook"** node (first node in the workflow)
2. Copy the **Production URL** (it will look like: `https://your-n8n.com/webhook/aether-chat`)
3. Save and **Activate** the workflow (toggle switch at top)

### Step 3: Update Your .env.local
1. Open `/Users/shivampatel/aether-isle/web/.env.local`
2. Replace the `N8N_WEBHOOK_URL` with the URL you just copied:
   ```
   N8N_WEBHOOK_URL=https://your-n8n.com/webhook/aether-chat
   ```
3. Restart your Next.js dev server

## How It Works

The workflow has 6 nodes:

1. **Webhook** - Receives POST requests from your app
2. **Extract Message** - Gets the user's message
3. **Build Context** - Creates portfolio context from shares data
4. **Call Gemini AI** - Sends the prompt to Google Gemini
5. **Extract Response** - Parses the AI reply
6. **Respond to Webhook** - Returns the reply to your app

## Test It

1. Go to `http://localhost:3001/dashboard/ai-insights`
2. Select **Shares** from the source menu
3. Type a message like "What's my portfolio worth?"
4. You should see the AI response powered by n8n!

---

> [!TIP]
> You can view workflow executions in n8n under **Executions** to debug any issues.
