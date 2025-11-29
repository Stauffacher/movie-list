# 🔧 Quick Fix: Firestore Permission Errors

## The Problem

You're seeing errors like:
- `FirebaseError: Missing or insufficient permissions`
- `permission-denied`

This means your **Firestore Security Rules** are blocking access. Your API keys are fine - the rules just need to be updated.

## The Solution (Takes 2 Minutes)

### Step 1: Open Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top

### Step 2: Replace the Rules

You'll see something like this (which blocks all access):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;  // ❌ This blocks everything
    }
  }
}
```

**Replace it with this:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /movies/{document=**} {
      allow read, write: if true;  // ✅ Allows access to movies collection
    }
  }
}
```

### Step 3: Publish

1. Click the **Publish** button (top right)
2. Wait for the green success message

### Step 4: Refresh Your App

Go back to your app and refresh the page. It should work now! 🎉

---

## What Changed?

- **Before**: Rules blocked all access (`if false`)
- **After**: Rules allow read/write to the `movies` collection (`if true`)

## ⚠️ Security Note

These rules allow **anyone** to read/write your movies. This is fine for development/testing. For production, you'll want to add authentication and restrict access to specific users.

## Still Not Working?

1. **Wait 30-60 seconds** - Rules can take a moment to propagate
2. **Hard refresh** your browser (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check the collection name** - Make sure it's exactly `movies` (lowercase)
4. **Verify you clicked Publish** - Rules won't take effect until published

