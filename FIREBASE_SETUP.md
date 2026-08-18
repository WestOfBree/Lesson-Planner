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

Notes for `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`:

- Use the raw bucket name only (no `gs://` prefix).
- For most projects this is either `your-project-id.appspot.com` or `your-project-id.firebasestorage.app`.

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

## 4. Firebase Storage Rules (Required for Skill Videos)

This repo includes storage rules in `storage.rules` for skill videos under `coaches/{uid}/skills/**`.

Deploy rules:

```bash
npx firebase-tools deploy --only storage:rules
```

If uploads still fail from localhost, confirm Firebase Storage is enabled in the Firebase console for your project and verify `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` matches your actual bucket name.

## 5. Storage CORS for Local Development

If the browser reports a preflight/CORS error while uploading videos from `http://localhost:3000`, set CORS on your storage bucket.

The canonical bucket for this project is:

- `aerial-coach.firebasestorage.app`

Run these commands in Google Cloud Shell (or any environment with `gsutil`):

```bash
cat > cors.json <<'EOF'
[
	{
		"origin": ["http://localhost:3000", "http://localhost:3001"],
		"method": ["GET", "POST", "PUT", "HEAD", "DELETE", "OPTIONS"],
		"responseHeader": [
			"Content-Type",
			"Authorization",
			"x-goog-upload-command",
			"x-goog-upload-content-type",
			"x-goog-upload-protocol",
			"x-goog-upload-header-content-length",
			"x-goog-upload-offset"
		],
		"maxAgeSeconds": 3600
	}
]
EOF

gsutil cors set cors.json gs://aerial-coach.firebasestorage.app
gsutil cors get gs://aerial-coach.firebasestorage.app
```

After updating CORS, restart the Next dev server.
