# Firebase Setup

## 1. Environment Variables

Create a local env file and add your Firebase web app config values:

```bash
cp .env.example .env.local
```

Fill in:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 2. Firestore Security Rules

This repo includes restrictive rules in `firestore.rules`:

- Users can only read/write their own `coachState/{uid}` document.
- All other document paths are denied.

Deploy rules:

```bash
npx firebase-tools deploy --only firestore:rules
```

## 3. Data Model in Firestore

The app stores each coach workspace in:

- Collection: `coachState`
- Document ID: Firebase Auth `uid`

State is synced from `app/lib/coach-store.tsx`.
