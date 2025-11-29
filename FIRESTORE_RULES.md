# Firestore Security Rules Setup

## Quick Fix: Update Your Firestore Rules

The "Missing or insufficient permissions" error is caused by Firestore Security Rules blocking access. Follow these steps:

### Step 1: Open Firestore Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab at the top

### Step 2: Update the Rules

Replace the existing rules with this configuration:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /movies/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Step 3: Publish the Rules

1. Click **Publish** button
2. Wait for the confirmation that rules have been published

### Step 4: Test Your App

Refresh your application and try:
- Creating a movie
- Viewing the movie list
- Editing a movie
- Deleting a movie

All operations should now work!

---

## What These Rules Do

- `allow read, write: if true;` - Allows anyone to read and write to the `/movies` collection
- This is a **development setup** - not suitable for production with sensitive data

## For Production (Future Enhancement)

When you're ready to secure your app, you'll want to:

1. Add authentication (Firebase Auth)
2. Update rules to check user authentication:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /movies/{movieId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. Or restrict to specific users:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /movies/{movieId} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
       }
     }
   }
   ```

---

## Troubleshooting

- **Still getting permission errors?**
  - Make sure you clicked "Publish" after updating rules
  - Wait 1-2 minutes for rules to propagate
  - Clear browser cache and refresh

- **Rules editor showing errors?**
  - Check that you copied the entire rule block including `rules_version = '2';`
  - Make sure there are no syntax errors
  - The rules should be inside the `match /databases/{database}/documents { }` block

