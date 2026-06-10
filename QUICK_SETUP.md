# Quick Setup Guide

## 5-Minute Setup

### 1. Get Firebase Credentials (1 min)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Open project: **exam-guardian-system**
3. Click **Project Settings** (⚙️ icon)
4. Scroll to **Your apps** → Click your **Web** app
5. Copy this config (you need `apiKey` and `appId`):
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",              ← COPY THIS
     authDomain: "exam-guardian-system.firebaseapp.com",
     projectId: "exam-guardian-system",
     storageBucket: "exam-guardian-system.firebasestorage.app",
     messagingSenderId: "308364840871",
     appId: "1:308364840871:web:..." ← COPY THIS
   };
   ```

### 2. Fill `.env.local` (1 min)
Edit `.env.local` in your project root:
```env
VITE_FIREBASE_API_KEY=AIza...your_key_here
VITE_FIREBASE_AUTH_DOMAIN=exam-guardian-system.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=exam-guardian-system
VITE_FIREBASE_STORAGE_BUCKET=exam-guardian-system.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=308364840871
VITE_FIREBASE_APP_ID=1:308364840871:web:...your_app_id_here
```

### 3. Enable Firebase Services (2 min)

#### A. Enable Email/Password Authentication
1. In Firebase Console: **Authentication** tab
2. Click **Get Started**
3. Select **Email/Password**
4. Toggle **Enable**
5. Click **Save**

#### B. Enable Firestore Database
1. In Firebase Console: **Firestore Database** tab
2. Click **Create Database**
3. Select your region
4. Start in **Production mode**
5. Click **Create**

#### C. Update Firestore Security Rules (optional for dev)
1. Go to Firestore → **Rules** tab
2. Replace with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```
3. Click **Publish**

### 4. Start Development (1 min)
```bash
npm run dev
```

---

## ✅ Testing Checklist

- [ ] Fill `.env.local` with credentials
- [ ] Enable Firebase Authentication
- [ ] Enable Firestore Database
- [ ] Run `npm run dev`
- [ ] Sign up with email/password
- [ ] Verify you see the dashboard
- [ ] Test login from different browser/device with same email
- [ ] Refresh page → session persists
- [ ] Click logout → redirected to home
- [ ] Try accessing `/dashboard` without login → redirected to `/login`

---

## Common Issues

| Problem | Solution |
|---------|----------|
| "Firebase is not defined" | Restart dev server after .env.local |
| Users can't sign up | Check Email/Password auth enabled |
| "Permission denied" Firestore error | Update Firestore security rules |
| Session doesn't persist | Check browser console for errors |

---

## Firebase Console Checklist

```
🔍 Project: exam-guardian-system

📋 Authentication
  ☐ Email/Password enabled

📦 Firestore Database
  ☐ Database created
  ☐ Security rules updated

⚙️ Project Settings → Your apps
  ☐ Web app exists
  ☐ apiKey copied
  ☐ appId copied

📄 .env.local
  ☐ All 6 variables filled
  ☐ Restarted dev server
```

---

## Test User Accounts

After setup, create these test accounts:

**Student Account**
- Email: student@test.com
- Password: Test123!
- Role: Student

**Teacher Account**
- Email: teacher@test.com  
- Password: Test123!
- Role: Teacher

---

## Multi-Device Test

1. **Device A (Laptop)**
   - Sign up with `student@test.com`
   - See dashboard

2. **Device B (Phone/Tablet)**
   - Open same app
   - Sign in with same email/password
   - Same user, different device ✓

3. **Device A again**
   - Refresh page
   - Still logged in ✓

---

Done! 🎉 Your auth is now Firebase-powered and works across devices.

For full details, see: `FIREBASE_MIGRATION.md`
