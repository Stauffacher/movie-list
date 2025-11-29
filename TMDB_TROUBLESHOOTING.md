# TMDB API Key Troubleshooting

If you're seeing "TMDB API key is not configured" error even after adding the key to Replit Secrets, follow these steps:

## Step-by-Step Fix

### 1. Verify the Secret is Added Correctly

**In Replit Secrets Tab:**
- Open the Secrets tab (lock icon 🔒 in the left sidebar)
- Make sure you have an entry named exactly: `NEXT_PUBLIC_TMDB_API_KEY`
- Check that:
  - No extra spaces before or after the name
  - No quotes around the key value
  - The value is your actual TMDB API key

**Correct format:**
```
NEXT_PUBLIC_TMDB_API_KEY=your-actual-api-key-here
```

**Wrong formats:**
```
NEXT_PUBLIC_TMDB_API_KEY = your-key  ❌ (spaces around =)
"NEXT_PUBLIC_TMDB_API_KEY" = "your-key"  ❌ (quotes)
next_public_tmdb_api_key=your-key  ❌ (lowercase)
```

### 2. Restart Your Replit Project

**This is the most important step!**

Environment variables are only loaded when the server starts. After adding/changing secrets:

1. **Stop the running server:**
   - Click the "Stop" button in the Replit console (or press Ctrl+C)

2. **Start it again:**
   - Click "Run" or run `npm run dev`
   - Wait for the server to fully start

3. **Refresh your browser:**
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Or close and reopen the browser tab

### 3. Check Browser Console

Open the browser console (F12 or right-click → Inspect → Console) and look for:

- If you see debugging info about the API key check, it will show whether the key is being read
- Any other error messages that might help identify the issue

### 4. Verify Your API Key is Valid

1. Test your API key directly by visiting this URL in your browser (replace YOUR_KEY):
   ```
   https://api.themoviedb.org/3/search/multi?api_key=YOUR_KEY&query=test
   ```

2. You should see JSON data, not an error

3. If you get an error, your API key might be invalid - get a new one from TMDB

### 5. Check for Typos

Common mistakes:
- `NEXT_PUBLIC_TMDB_API_KEY` vs `NEXT_PUBLIC_TMDB_KEY` (missing API)
- `NEXT_PUBLIC_TMDB_API_KEY` vs `NEXT_PUBLIC_TMDB_APY_KEY` (typo)
- Extra spaces or special characters

### 6. Re-add the Secret

Sometimes secrets need to be removed and re-added:

1. Delete the `NEXT_PUBLIC_TMDB_API_KEY` secret
2. Add it again with the correct name and value
3. Restart the project
4. Refresh the browser

### 7. Check Replit Environment Variables

In Replit, you can also check environment variables from the shell:

1. Open the Shell tab
2. Run: `echo $NEXT_PUBLIC_TMDB_API_KEY`
3. It should print your API key (or be empty if not set)

## Still Not Working?

If none of the above works:

1. **Double-check you're using the Secrets tab** (not .env file)
   - Replit uses Secrets tab for environment variables
   - Files like `.env` won't work the same way

2. **Check Next.js environment variable rules:**
   - Client-side variables MUST start with `NEXT_PUBLIC_`
   - Server-side variables don't need the prefix but won't work in client components

3. **Verify the code is correct:**
   - The code uses: `process.env.NEXT_PUBLIC_TMDB_API_KEY`
   - Make sure your secret name matches exactly

4. **Contact support:**
   - Share screenshots of your Secrets tab (blur the actual key value)
   - Share the console error messages
   - Describe what you've tried

## Quick Checklist

- [ ] Secret name is exactly: `NEXT_PUBLIC_TMDB_API_KEY`
- [ ] Secret value is your actual TMDB API key (no quotes, no spaces)
- [ ] Project has been restarted after adding the secret
- [ ] Browser has been refreshed (hard refresh recommended)
- [ ] API key is valid (tested in browser)
- [ ] No typos in the secret name or value

## Testing After Fix

1. Open the app
2. Click "Add Entry"
3. Type at least 2 characters in the search field
4. You should see movie/TV results appear (no error message)

