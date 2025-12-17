# 🚀 TaskMate

TaskMate is a comprehensive task management app designed for seamless interaction between task creators and acceptors. With features like role-based access, strict task lifecycle validation, advanced filtering, and more.

---

## 🌟 Key Features

### 👤 Authentication
- **Google Authentication** using NextAuth
- Secure session handling
- **Role-based access**: Creator / Acceptor

---

### 🔁 Task Lifecycle (Core Logic)
Each task follows a strict, validated lifecycle:

`open` → `accepted` → `in_progress` → `work_done` → `payment_pending` → `payment_received` → `closed` (auto)

This ensures:
- No step skipping
- No unauthorized actions
- Clear responsibility at each stage

---

### 📝 Task Creation
When creating a task, the creator provides:
- **Title & description**
- **Category**: Cooking, Cleaning, Drying, Academics, Others
- **Price**
- **Hostel & room number**
- **Mandatory deadline**: Date + time

Creator details are auto-attached from Google Auth:
- Name
- Email
- Profile photo (with UI fallback if unavailable)

---

### 📊 Dashboard
Users can view:
- **Posted tasks (as Creator)**
- **Accepted tasks (as Acceptor)**
- **Total earnings** from completed tasks

Each task displays:
- Location (hostel & room)
- Deadline
- Category
- Creator info with avatar
- Current lifecycle status

---

### 🔍 Browse Tasks (Advanced UX)
The browse page supports:
- **Filter by category**
- **Filter by hostel**
- **Sort by nearest deadline**
- **Automatic hiding of expired tasks**
- ⚠️ **"Expiring Soon"** badge for tasks near their deadline

All filtering is done server-side for correctness and performance.

---

### 💰 Payment Handling
- Creator selects **payment method**: Cash / UPI / Online
- Acceptor confirms **payment received**
- System **automatically closes** the task afterward

---

## 🧱 Tech Stack

### Frontend
- **Next.js** (App Router)
- **React**
- **Tailwind CSS**

### Backend
- **Next.js API Routes**
- **Firebase Firestore**
- **Firebase Admin SDK**

### Authentication
- **NextAuth.js**
- **Google Provider**

### Deployment
- **Vercel**

---

## 🧠 Engineering Highlights
- 🔒 Role-based API protection
- 🕒 Strict lifecycle validation
- 🔄 Firestore timestamp serialization for Next.js safety
- 🧪 Defensive UI handling (null profile photos, old tasks)
- ⚠️ Correct handling of async searchParams in App Router
- ♻️ Auto-close logic implemented via controlled side-effects


---

## 🚀 Local Setup

1️⃣ **Clone the repo**
```bash
git clone https://github.com/manavi-24/task-mate.git
cd task-mate
```

2️⃣ **Install dependencies**
```bash
npm install
```

3️⃣ **Environment variables**

Create a `.env.local` file with the following:
```env
NEXTAUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```

4️⃣ **Run locally**
```bash
npm run dev
```

App will run at:
👉 [http://localhost:3000](http://localhost:3000)

---

## 🔐 Security & Validation

- Only **authenticated users** can create/accept tasks
- **Creator cannot accept their own task**
- Each API enforces correct task status
- Firestore-safe data structures only (no class instances)

---

## 👩‍💻 Author

**Manavi Sharma**   
NIT Hamirpur  

---

## ⭐ Why TaskMate?

TaskMate demonstrates:
- Real-world state management
- Backend + frontend integration
- Secure auth flows
- Thoughtful UX decisions
- Production-grade Next.js patterns
