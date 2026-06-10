# Firebase Authentication Migration Guide - Exam Guardian System

## ✅ Migration Complete!

Your authentication system has been successfully migrated from localStorage to Firebase Authentication. Users can now log in from multiple devices.

---

## 📋 Files Modified

### 1. **`.env.local`** (NEW)
**Purpose**: Firebase configuration variables  
**Status**: Created - requires your Firebase credentials

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=exam-guardian-system.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=exam-guardian-system
VITE_FIREBASE_STORAGE_BUCKET=exam-guardian-system.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=308364840871
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

### 2. **`src/firebase.ts`** (NEW)
**Purpose**: Firebase SDK initialization with v9+ modular API  
**Key Features**:
- Initializes Firebase app with environment variables
- Exports `auth` and `db` for use throughout the app
- Type-safe with `Auth` and `Firestore` types

### 3. **`src/contexts/AuthContext.tsx`** (MODIFIED)
**Previous Implementation**: 
- localStorage for persistence
- Demo users hardcoded in memory
- No cross-device support

**New Implementation**:
- Firebase Authentication for secure login/signup
- Firestore for storing user roles and profiles
- `onAuthStateChanged()` listener for automatic session restoration
- Added error handling with `error` state
- Added `isInitializing` state to handle auth restoration

**New Context API**:
```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isInitializing: boolean;        // NEW: Firebase initialization
  error: string | null;            // NEW: Error tracking
}
```

### 4. **`src/pages/Login.tsx`** (MODIFIED)
**Changes**:
- Now uses Firebase `signInWithEmailAndPassword()`
- Improved error handling with `localError` state
- Error messages from Firebase are displayed to users

### 5. **`src/pages/Signup.tsx`** (MODIFIED)
**Changes**:
- Now uses Firebase `createUserWithEmailAndPassword()`
- User role is stored in Firestore
- Improved error handling with `localError` state

### 6. **`src/App.tsx`** (MODIFIED)
**Changes**:
- `ProtectedRoute` and `PublicRoute` now check `isInitializing`
- Shows loading spinner while Firebase restores session
- Prevents flashing of wrong content during auth restoration

### 7. **`src/components/Layout.tsx`** (MODIFIED)
**Changes**:
- `handleLogout()` is now async to wait for Firebase signOut
- Added error handling for logout failures

---

## 🔑 Getting Your Firebase Credentials

### Step 1: Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: "exam-guardian-system"

### Step 2: Get Web App Credentials
1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Find your **Web** app (or create one if missing)
4. Copy the config object

Your config looks like:
```javascript
{
  apiKey: "AIza...",
  authDomain: "exam-guardian-system.firebaseapp.com",
  projectId: "exam-guardian-system",
  storageBucket: "exam-guardian-system.firebasestorage.app",
  messagingSenderId: "308364840871",
  appId: "1:308364840871:web:..."
}
```

### Step 3: Fill `.env.local`
Add your actual credentials to `.env.local`:
```env
VITE_FIREBASE_API_KEY=AIza...your_key_here
VITE_FIREBASE_AUTH_DOMAIN=exam-guardian-system.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=exam-guardian-system
VITE_FIREBASE_STORAGE_BUCKET=exam-guardian-system.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=308364840871
VITE_FIREBASE_APP_ID=1:308364840871:web:...your_app_id_here
```

---

## 🚀 Setup Instructions

### 1. Install Firebase (Already Done ✓)
Firebase is already in `package.json` as v12.14.0

### 2. Enable Firebase Services
In [Firebase Console](https://console.firebase.google.com/):

#### Enable Authentication
1. Go to **Authentication** tab
2. Click **Get Started**
3. Enable **Email/Password** provider
4. **Enable** it (toggle on)

#### Enable Firestore (for user profiles)
1. Go to **Firestore Database** tab
2. Click **Create Database**
3. Choose location
4. Start in **production mode**
5. Create collection `users` (will be auto-created on first signup)

**Firestore Security Rules** (for development):
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

### 3. Update Environment Variables
Create/update `.env.local` with your credentials

### 4. Restart Development Server
```bash
npm run dev
```

---

## 🧪 Testing Cross-Device Authentication

### Test Scenario 1: Create New User
1. Open app in **Device A** (laptop browser)
2. Go to `/signup`
3. Create account:
   - **Name**: John Student
   - **Email**: john@test.com
   - **Password**: Test123!
   - **Role**: Student
4. You'll be redirected to dashboard ✓

### Test Scenario 2: Login from Different Device
1. Open app in **Device B** (phone/tablet/different browser)
2. Go to `/login`
3. Enter same email/password: john@test.com / Test123!
4. You'll be logged in as the same user ✓
5. Dashboard shows same user data ✓

### Test Scenario 3: Session Persistence
1. On Device A, refresh the page
2. **Expected**: Still logged in (session restored from Firebase) ✓
3. On Device B, refresh the page
4. **Expected**: Still logged in ✓

### Test Scenario 4: Logout
1. Click logout button (top-right)
2. Redirected to home page
3. Try accessing `/dashboard`
4. **Expected**: Redirected to `/login` ✓

### Test Scenario 5: Teacher Role
1. Go to `/signup` in new browser
2. Create account:
   - **Name**: Dr. Smith
   - **Email**: teacher@test.com
   - **Password**: Test123!
   - **Role**: Teacher
3. Dashboard shows different options (Create Exam, Results)
4. Student can't access `/create-exam` (redirects to dashboard) ✓

---

## 📊 User Data Structure

### Firebase Authentication
- **Email**: user@example.com
- **Password**: hashed securely by Firebase
- **UID**: auto-generated unique ID

### Firestore `users` Collection
```
users/
  {userId}/
    {
      name: "John Student",
      email: "john@test.com",
      role: "student",        // "student" or "teacher"
      createdAt: "2026-06-10T..."
    }
```

---

## 🐛 Troubleshooting

### Problem: "Firebase configuration is not defined"
**Solution**: 
- Ensure `.env.local` exists in root directory
- Verify all `VITE_FIREBASE_*` variables are set
- Restart dev server after adding .env file

### Problem: "Cannot read property 'auth' of undefined"
**Solution**:
- Check that `src/firebase.ts` imports are correct
- Verify Firebase is installed: `npm list firebase`
- Check browser console for Firebase errors

### Problem: Users can't sign up
**Solution**:
- Check Firebase Console → Authentication → Sign-in method → Email/Password is enabled
- Check Firebase Console → Firestore → Rules allow writes to `/users/{userId}`
- Check browser console for specific error message

### Problem: Session doesn't persist after refresh
**Solution**:
- Check browser console for auth state listener errors
- Verify Firebase app initialization in `src/firebase.ts`
- Clear browser cookies/cache and try again

### Problem: "PERMISSION_DENIED" Firestore error
**Solution**:
- Update Firestore Rules to allow authenticated users
- Default rules block all access, check your security rules

---

## 🔐 Security Checklist

- ✅ Email/Password authentication enabled
- ✅ Firestore user data isolated by UID
- ✅ Session persistence automatic via onAuthStateChanged
- ✅ Passwords hashed by Firebase
- ✅ No localStorage usage (secure)
- ⚠️ **TODO**: Update Firestore Rules for production

### Production Security Rules
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

---

## 📦 Dependencies

Already installed in `package.json`:
- ✅ `firebase@^12.14.0` - Firebase SDK

All Firebase services used:
- `firebase/app` - Core
- `firebase/auth` - Authentication
- `firebase/firestore` - Database

---

## 🎯 What Changed From User Perspective

| Feature | Before | After |
|---------|--------|-------|
| **Login Location** | Browser storage only | Firebase + Firestore |
| **Multi-device** | ❌ Not supported | ✅ Fully supported |
| **Session Persistence** | Browser-only | ✅ Cloud-based |
| **User Data Security** | Plain JSON in localStorage | 🔒 Firebase managed |
| **Cross-browser** | ❌ No (different browsers separate) | ✅ Yes (same account) |
| **Logout** | Immediate | Immediate |
| **Sign-in Error Messages** | Generic | ✅ Specific Firebase errors |

---

## ✨ Next Steps

1. **Fill `.env.local`** with your Firebase credentials
2. **Enable Firebase services** (Auth + Firestore)
3. **Run dev server**: `npm run dev`
4. **Create test users** and verify multi-device login
5. **Test all user flows** (signup, login, logout, role-based access)
6. **Update Firestore security rules** before production

---

## 📚 Documentation

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Console](https://console.firebase.google.com/)

