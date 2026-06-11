# Firestore Migration - Complete Documentation

## Migration Summary

The Exam Guardian System has been fully migrated from React Context local state to Firebase Firestore as the single source of truth. All exam data, submissions, and results are now stored in Firestore with real-time synchronization.

---

## Collections Created

### 1. `users` Collection
Stores user profile information created during signup.

**Fields:**
- `uid` (string): Firebase Authentication UID
- `name` (string): User's full name
- `email` (string): User's email address
- `role` (string): Either "teacher" or "student"
- `createdAt` (timestamp): Account creation timestamp

**Example Document:**
```json
{
  "uid": "abc123xyz",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "teacher",
  "createdAt": "2026-06-11T10:30:00Z"
}
```

---

### 2. `exams` Collection
Stores all exams created by teachers.

**Fields:**
- `id` (string): Firestore document ID
- `title` (string): Exam title
- `description` (string): Exam description
- `duration` (number): Duration in minutes
- `startTime` (string): ISO 8601 datetime string
- `endTime` (string): ISO 8601 datetime string
- `questions` (array): Array of question objects
  - `id` (string): Question ID
  - `type` (string): "mcq" or "short"
  - `text` (string): Question text
  - `points` (number): Points for this question
  - `correctAnswer` (string): Correct answer
  - `options` (array, optional): MCQ options
    - `id` (string): Option ID (a, b, c, d)
    - `text` (string): Option text
- `teacherId` (string): UID of teacher who created exam
- `teacherName` (string): Name of teacher
- `createdAt` (timestamp): Exam creation timestamp
- `status` (string, optional): Exam status

**Example Document:**
```json
{
  "title": "Data Structures & Algorithms",
  "description": "Mid-semester examination",
  "duration": 30,
  "startTime": "2026-06-12T09:00:00Z",
  "endTime": "2026-06-30T23:59:00Z",
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "text": "What is the time complexity of binary search?",
      "points": 5,
      "correctAnswer": "b",
      "options": [
        {"id": "a", "text": "O(n)"},
        {"id": "b", "text": "O(log n)"},
        {"id": "c", "text": "O(n²)"},
        {"id": "d", "text": "O(1)"}
      ]
    }
  ],
  "teacherId": "abc123xyz",
  "teacherName": "John Doe",
  "createdAt": "2026-06-11T10:00:00Z"
}
```

---

### 3. `submissions` Collection
Stores all exam submissions by students.

**Fields:**
- `id` (string): Firestore document ID
- `examId` (string): ID of the exam (references exams collection)
- `studentId` (string): UID of student who submitted
- `studentName` (string): Name of student
- `answers` (object): Key-value pairs of question ID to student's answer
- `score` (number): Points scored
- `totalPoints` (number): Total possible points
- `tabSwitches` (number): Number of tab switches detected during exam
- `submittedAt` (timestamp): Submission timestamp

**Example Document:**
```json
{
  "examId": "exam123",
  "studentId": "student456",
  "studentName": "Alice Smith",
  "answers": {
    "q1": "b",
    "q2": "a",
    "q3": "Polymorphism allows objects to have multiple forms"
  },
  "score": 15,
  "totalPoints": 20,
  "tabSwitches": 1,
  "submittedAt": "2026-06-12T09:45:00Z"
}
```

---

## Firestore Queries Used

### In ExamContext.tsx

**1. Load all exams (real-time):**
```typescript
const examsRef = collection(db, "exams");
const examsQuery = query(examsRef, orderBy("createdAt", "desc"));
onSnapshot(examsQuery, (snapshot) => {
  // Process exams
});
```

**2. Load all submissions (real-time):**
```typescript
const submissionsRef = collection(db, "submissions");
const submissionsQuery = query(submissionsRef, orderBy("submittedAt", "desc"));
onSnapshot(submissionsQuery, (snapshot) => {
  // Process submissions
});
```

**3. Create new exam:**
```typescript
const examsRef = collection(db, "exams");
const docRef = await addDoc(examsRef, {
  title,
  description,
  duration,
  startTime,
  endTime,
  questions,
  teacherId: user.id,
  teacherName: user.name,
  createdAt: new Date().toISOString(),
});
```

**4. Submit exam result:**
```typescript
const submissionsRef = collection(db, "submissions");
await addDoc(submissionsRef, {
  examId: exam.id,
  studentId: user.id,
  studentName: user.name,
  answers,
  score,
  totalPoints,
  tabSwitches,
  submittedAt: new Date().toISOString(),
});
```

---

## Security Rules

All security rules are defined in `firestore.rules`:

### Collection-Level Rules

**Users Collection:**
- ✅ Users can read their own profile
- ✅ Users can update their own profile
- ✅ Only admins/system can create user documents (via Cloud Functions)
- ✅ Users can verify role on signup

**Exams Collection:**
- ✅ Teachers can create exams (role verification)
- ✅ Teachers can read/update/delete only their own exams
- ✅ Students can read all exams (to view and take them)
- ✅ Students cannot create/modify exams

**Submissions Collection:**
- ✅ Students can create submissions (submit exam)
- ✅ Students can read only their own submissions
- ✅ Teachers can read submissions for their exams
- ✅ No one can modify submissions after creation (immutable)

**Default:** All other document access is denied.

---

## Files Modified

### Context Files
1. **[src/contexts/ExamContext.tsx](src/contexts/ExamContext.tsx)**
   - Replaced local React state with Firestore real-time listeners
   - Removed mock data (SAMPLE_QUESTIONS, INITIAL_EXAMS, INITIAL_RESULTS)
   - Updated `addExam` to `createExam` (async, returns Promise)
   - Updated `submitResult` to submit to Firestore (async)
   - Added `isLoading` state for loading indicator
   - Uses `onSnapshot` for real-time data sync

### Pages
2. **[src/pages/CreateExam.tsx](src/pages/CreateExam.tsx)**
   - Changed from `addExam` to `createExam` (async function)
   - Changed field from `createdBy` to `teacherId` and added `teacherName`
   - Added loading state (`isSubmitting`)
   - Added error handling for Firestore operations
   - Updated button to show loading state during submission

3. **[src/pages/ExamInterface.tsx](src/pages/ExamInterface.tsx)**
   - Updated `handleSubmit` to be async
   - Added error handling for Firestore submission
   - Uses `await submitResult()` instead of synchronous call
   - Improved error feedback to user

4. **[src/pages/Results.tsx](src/pages/Results.tsx)**
   - Changed from `createdBy` to `teacherId` when filtering exams
   - All data now loaded from Firestore (no changes to query logic needed)

### Components
5. **[src/components/TeacherDashboard.tsx](src/components/TeacherDashboard.tsx)**
   - Changed from `createdBy` to `teacherId` when filtering exams
   - All data now loaded from Firestore in real-time

### Auth Context
6. **[src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)**
   - Already creates user documents in Firestore during signup
   - No changes needed (verified ✓)

---

## Data Migration Steps (If Migrating Existing Data)

If you have existing exams in localStorage, follow these steps:

1. **Export from localStorage:**
```javascript
const exams = JSON.parse(localStorage.getItem('exams'));
const results = JSON.parse(localStorage.getItem('results'));
```

2. **Import to Firestore using Firebase Console or script:**
```javascript
for (const exam of exams) {
  await addDoc(collection(db, "exams"), {
    ...exam,
    teacherId: exam.createdBy, // Map old field to new
    teacherName: "Migrated Teacher",
    createdAt: new Date().toISOString()
  });
}
```

3. **Clear localStorage:**
```javascript
localStorage.removeItem('exams');
localStorage.removeItem('results');
```

---

## Real-Time Sync Features

### Teacher Creates Exam
1. Teacher clicks "Create Exam" in [src/pages/CreateExam.tsx](src/pages/CreateExam.tsx)
2. Form data sent to Firestore via `createExam()`
3. Document added to `exams` collection
4. **ALL** students' StudentDashboard instantly updates via `onSnapshot` listener
5. Students see new exam appear without page refresh

### Student Submits Exam
1. Student completes exam and clicks "Submit" in [src/pages/ExamInterface.tsx](src/pages/ExamInterface.tsx)
2. Submission data sent to Firestore via `submitResult()`
3. Document added to `submissions` collection
4. **ALL** teacher dashboards instantly update via `onSnapshot` listener
5. Teachers see new submission in results dashboard without refresh

---

## Breaking Changes

### Removed
❌ All localStorage usage
❌ Mock data (SAMPLE_QUESTIONS, INITIAL_EXAMS, INITIAL_RESULTS)
❌ Local React state for exam data
❌ Field: `createdBy` (replaced with `teacherId`)
❌ Synchronous `addExam()` function

### Added
✅ Async `createExam()` function
✅ Async `submitResult()` function
✅ Real-time listeners with `onSnapshot`
✅ Field: `teacherId` and `teacherName`
✅ Field: `isLoading` in ExamContext
✅ Error handling for all Firestore operations

### Updated Field Names
| Old Field | New Field | Collections |
|-----------|-----------|-------------|
| `createdBy` | `teacherId` | exams |
| N/A | `teacherName` | exams |

---

## Testing Checklist

- [ ] Teacher can create exam → Appears in Firestore `exams` collection
- [ ] Student sees exam instantly on another device/browser
- [ ] Student can take exam and submit
- [ ] Submission appears in Firestore `submissions` collection
- [ ] Teacher sees new submission instantly on results page
- [ ] Exam scoring is calculated correctly
- [ ] Teacher can filter results by their exams only
- [ ] Student can see only their submissions in "My Results"
- [ ] Security rules prevent students from creating exams
- [ ] Security rules prevent students from seeing other students' submissions
- [ ] Refreshing page doesn't lose exam data (real-time sync)
- [ ] Multiple tabs/devices stay in sync

---

## Firestore Deployment

Deploy security rules:

```bash
# Using Firebase CLI
firebase deploy --only firestore:rules
```

Or deploy through Firebase Console:
1. Go to Firestore → Rules
2. Copy content from `firestore.rules`
3. Click "Publish"

---

## Database Indexes

Firestore will automatically create required indexes. If you get index warning, use the link in the error message to create them automatically.

### Recommended Indexes
- `exams`: index on `teacherId` and `createdAt`
- `submissions`: index on `studentId` and `submittedAt`
- `submissions`: index on `examId` and `submittedAt`

---

## Performance Optimization

Current implementation uses:
- ✅ **Real-time listeners** (`onSnapshot`) for automatic sync
- ✅ **Ordered queries** (`orderBy`) for consistent ordering
- ✅ **Collection-level queries** (no cross-document reads in rules)
- ✅ **Document ID indexing** for fast lookups

Future optimization options:
- Add pagination for large result sets
- Implement Firestore caching
- Add computed fields using Cloud Functions
- Batch write operations for bulk imports

---

## Support & Documentation

- **Firebase Documentation**: https://firebase.google.com/docs/firestore
- **Firestore Security Rules**: https://firebase.google.com/docs/firestore/security
- **Real-time Updates**: https://firebase.google.com/docs/firestore/query-data/listen
- **Web SDK Modular API**: https://firebase.google.com/docs/web/modular-setup
