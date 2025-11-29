# TMDB API Setup Guide

This application uses The Movie Database (TMDB) API for autocomplete search functionality. Follow these steps to configure it:

## 1. Get a TMDB API Key

1. Go to [TMDB](https://www.themoviedb.org/)
2. Create a free account or log in
3. Go to **Settings** → **API** in your account
4. Click **Request an API Key**
5. Fill out the form:
   - **Type**: Developer
   - **Application Name**: Movie List App (or your app name)
   - **Application URL**: Your website URL (can be localhost for development)
   - **Application Summary**: Brief description of your app
6. Accept the terms and click **Submit**
7. Copy your **API Key** (also called "API Read Access Token")

## 2. Add Environment Variable in Replit

Add this environment variable in your **Replit Secrets Tab**:

```
NEXT_PUBLIC_TMDB_API_KEY=your-tmdb-api-key-here
```

**Important Notes:**
- The `NEXT_PUBLIC_` prefix is required for Next.js to expose this variable to the client
- Replace `your-tmdb-api-key-here` with your actual TMDB API key
- In Replit, go to the Secrets tab (lock icon) in the sidebar to add this

## 3. Restart Your Application

After adding the API key:
1. Restart your Replit project
2. The autocomplete search should now work!

## How It Works

- When users type at least 2 characters in the search field, the app queries TMDB
- Results show movies and TV series with:
  - Title
  - Year
  - Type (Movie/Series)
  - Poster image
- Selecting a result autofills:
  - Title
  - Type (Movie or Series)
  - Cover Image URL (poster)

## Troubleshooting

### "TMDB API key is not configured" Error
- Make sure you added `NEXT_PUBLIC_TMDB_API_KEY` to Replit Secrets
- Restart your application after adding the key
- Check that the key name is exactly `NEXT_PUBLIC_TMDB_API_KEY`

### No Results Appearing
- Verify your API key is valid by checking TMDB account settings
- Check browser console for error messages
- Make sure you typed at least 2 characters

### Rate Limiting
- TMDB free tier allows 40 requests per 10 seconds
- If you hit the limit, wait a moment and try again

## API Documentation

- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [Search Multi Endpoint](https://developers.themoviedb.org/3/search/search-multi)

