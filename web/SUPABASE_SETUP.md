# Supabase Setup Guide

Follow these steps to set up Supabase for the Aether Isle project.

## 1. Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: Aether Isle
   - **Database Password**: (generate strong password - save it!)
   - **Region**: Choose closest to you
4. Click "Create new project" and wait 1-2 minutes

## 2. Get Your Credentials

1. In your project, go to **Settings** (gear icon) → **API**
2. Find and copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

## 3. Set Up Environment Variables

1. In your project folder `/web`, create a file called `.env.local`
2. Add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace `https://your-project.supabase.co` and `your-anon-key-here` with your actual values.

## 4. Create Database Tables

1. In Supabase dashboard, go to **SQL Editor** (on left sidebar)
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` file from your project
4. Paste into the SQL editor
5. Click "Run" to execute

This creates:
- `access_requests` table with all necessary columns
- Row Level Security policies
- Indexes for performance
- Automatic timestamp triggers

## 5. Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see the `access_requests` table
3. Click on it to verify columns are created

## 6. Test the Integration

Once you've completed steps 1-5, your forms will:
- Submit access requests to Supabase
- Store user data securely
- Allow you to review requests in the Supabase dashboard

You can view all submitted requests by:
1. Going to **Table Editor** → `access_requests`
2. Viewing all entries with their status

## Approving Users

When you want to approve an access request:

1. Go to **Authentication** → **Users** in Supabase
2. Click "Invite user" or "Add user"
3. Enter the email from the approved request
4. Set a password
5. User can now login via the "Continue" form

## Security Notes

- ✅ All authentication keys are hashed before storage
- ✅ Row Level Security prevents unauthorized access
- ✅ Only request submitters can see their own requests
- ✅ Public can only INSERT new requests, not read others

## Troubleshooting

**"Missing Supabase environment variables" error**:
- Make sure `.env.local` exists in the `/web` folder
- Restart your development server after creating `.env.local`

**Table not created**:
- Check SQL Editor for errors
- Ensure you're running the query in the correct project

**Can't submit forms**:
- Verify environment variables are correct
- Check browser console for errors
- Check Supabase dashboard logs
