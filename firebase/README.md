# Firebase Documentation - School Management System

## Project Information

| Setting | Value |
|---------|-------|
| **Project ID** | `amanuelschool-78888` |
| **Console** | https://console.firebase.google.com/project/amanuelschool-78888 |
| **Realtime Database URL** | `https://newschool-15515-default-rtdb.firebaseio.com` |
| **Storage Bucket** | `amanuelschool-78888.firebasestorage.app` |

---

## Files in This Folder

| File | Description |
|------|-------------|
| `firebase-config.env` | Environment variables for Firebase |
| `firebase-config.ts` | Web SDK configuration (client-side) |
| `firebase-admin.ts` | Admin SDK configuration (server-side) |
| `firebase-db.ts` | Data layer that replaces Prisma ORM |
| `firebase-rest-api.ts` | REST API helper functions |
| `firebase-seed.ts` | Seed script for demo data |

---

## How to Use in Another Project

### Step 1: Copy Files

Copy these files to your new project:
```
firebase/
├── firebase-config.ts    → src/lib/firebase-config.ts
├── firebase-admin.ts     → src/lib/firebase-admin.ts
├── firebase-db.ts        → src/lib/firebase-db.ts
├── firebase-rest-api.ts  → src/lib/firebase.ts
└── firebase-seed.ts      → scripts/seed-firebase.ts
```

### Step 2: Update src/lib/db.ts

```typescript
// src/lib/db.ts
export { db } from './firebase-db'
```

### Step 3: Install Dependencies

```bash
bun add firebase firebase-admin bcryptjs
```

### Step 4: Set Environment Variables

Create `.env` file:
```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"amanuelschool-78888",...}
```

### Step 5: Seed the Database

```bash
bun run scripts/seed-firebase.ts
```

### Step 6: Use in API Routes

```typescript
import { db } from '@/lib/db'

// Same interface as Prisma
const users = await db.user.findMany()
const user = await db.user.findUnique({ where: { email: 'test@test.com' } })
await db.user.create({ data: { email: 'new@test.com', name: 'New User' } })
await db.user.update({ where: { id: '123' }, data: { name: 'Updated' } })
await db.user.delete({ where: { id: '123' } })
```

---

## Supported Methods

| Method | Description |
|--------|-------------|
| `findUnique` | Find one record by where clause |
| `findFirst` | Find first matching record |
| `findMany` | Find all matching records |
| `create` | Create a new record |
| `update` | Update a record |
| `upsert` | Create or update |
| `updateMany` | Update multiple records |
| `delete` | Delete a record |
| `deleteMany` | Delete multiple records |
| `count` | Count matching records |
| `aggregate` | Sum, avg, min, max, count |
| `groupBy` | Group records by field |
| `$transaction` | Run multiple operations |

### Supported Where Operators
- `equals`, `not`, `contains`, `startsWith`, `endsWith`
- `in`, `notIn`, `gt`, `gte`, `lt`, `lte`
- `AND`, `OR`, `NOT`

### Supported Options
- `where` - filter conditions
- `include` - load relations
- `orderBy` - sort results
- `take` - limit results
- `skip` - skip results
- `select` - select specific fields
- `distinct` - distinct values

---

## Database Collections (41)

```
users, sessions, students, teachers, grades, sections, subjects,
academicYears, semesters, teacherAssignments, curricula, lessonPlans,
timetables, examTypes, exams, gradingSystems, holidays,
marks, attendance, assignments, assignmentSubmissions,
promotions, reportCards, ranks,
financeStaff, financeTransactions, feeStructures,
librarians, books, libraryLoans,
hrStaff, idCards, certificates,
cmsPages, siteSettings, socialLinks, mediaItems,
contactMessages, notifications, events, registrationApplications
```

---

## Firebase Web Config

```javascript
const firebaseConfig = {
  apiKey: 'AIzaSyCLNBAMGP14NleTPkgqgn6wCqMLXvmHqVA',
  authDomain: 'amanuelschool-78888.firebaseapp.com',
  databaseURL: 'https://newschool-15515-default-rtdb.firebaseio.com',
  projectId: 'amanuelschool-78888',
  storageBucket: 'amanuelschool-78888.firebasestorage.app',
  messagingSenderId: '964618295727',
  appId: '1:964618295727:web:e19a1bdd4a58fbde84375a',
  measurementId: 'G-65ZTJ3FL7S',
}
```

---

## Service Account

```
Email: firebase-adminsdk-fbsvc@amanuelschool-78888.iam.gserviceaccount.com
```

Download the full JSON key from:
https://console.firebase.google.com/project/amanuelschool-78888/settings/serviceaccounts/adminsdk
