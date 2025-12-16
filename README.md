

## 🎯 Problem Statement

Most task apps fail to model **real payment workflows**.  
TaskMate fixes this by enforcing **strict role-based actions**:

- Work must be completed **before** payment is chosen
- Payment must be confirmed **by the receiver**
- Tasks close automatically once the lifecycle is complete

---

## 🔁 Task Lifecycle (Canonical Flow)

open
→ accepted
→ in_progress
→ work_done
→ payment_pending
→ payment_received
→ closed


---

## 👤 Role-Based Actions

| Step | Action | Who |
|---|---|---|
| Accept task | Accept | Acceptor |
| Start task | Start | Acceptor |
| Finish work | Mark work done | Acceptor |
| Choose payment | Select payment method | Creator |
| Complete task | Mark complete | Creator |
| Confirm payment | Payment received | Acceptor |
| Close task | Auto/system | System |

This mirrors **real hostel gig workflows**.

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16 (App Router)**
- **React**
- **Tailwind CSS**

### Backend
- **Next.js API Routes (App Router)**
- **Firebase Admin SDK**
- **Firestore (NoSQL Database)**

### Authentication
- **NextAuth.js**
- **Google OAuth**

### Deployment
- **Vercel**
- **Google Cloud Console (OAuth & Service Account)**

---

## 📦 Key Dependencies

```json
{
  "next": "^16.0.10",
  "react": "^18",
  "next-auth": "^4",
  "firebase-admin": "^12",
  "tailwindcss": "^3"
}

📁 Project Structure
app/
├── api/
│   └── tasks/
│       ├── accept/
│       ├── start/
│       ├── work-done/
│       ├── complete/
│       ├── payment-received/
│       └── close/
│
├── tasks/
│   └── page.tsx
│
├── dashboard/
│   └── page.tsx
│
├── page.tsx            // redirects to /tasks
│
components/
├── TaskRow.tsx
│
lib/
├── auth.ts
├── firebaseAdmin.ts

🔐 Authentication Strategy

Google OAuth using NextAuth

Server-side auth with:

getServerSession(authOptions)


⚠️ getToken() is never used (not App Router safe).

🔥 Firestore Task Schema
{
  "title": "Clean my room",
  "description": "Need help cleaning",
  "price": 100,
  "category": "Cleaning",
  "status": "payment_pending",

  "createdBy": {
    "email": "creator@email.com",
    "name": "Creator Name"
  },

  "acceptedBy": {
    "email": "acceptor@email.com",
    "name": "Acceptor Name"
  },

  "paymentMethod": "upi",

  "createdAt": "...",
  "acceptedAt": "...",
  "startedAt": "...",
  "workDoneAt": "...",
  "completedAt": "...",
  "paymentReceivedAt": "...",
  "closedAt": "..."
}

🔒 Backend Design Principles

Role-based authorization in every API route

Task status validation before updates

Firestore transactions for consistency

Firebase Admin runs only on Node.js runtime

export const runtime = "nodejs";

🔗 API Routes
Route	Purpose
/api/tasks/accept	Accept task
/api/tasks/start	Start task
/api/tasks/work-done	Mark work done
/api/tasks/complete	Creator completes task
/api/tasks/payment-received	Acceptor confirms payment
/api/tasks/close	System auto-closes task
🖥️ UI Behavior

Buttons appear only for:

Correct role

Correct task status

Task closes automatically after payment confirmation

No client-side database access

⚙️ Local Setup
1️⃣ Clone Repository
git clone https://github.com/your-username/task-mate.git
cd task-mate

2️⃣ Install Dependencies
npm install

3️⃣ Environment Variables (.env.local)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

4️⃣ Run Locally
npm run dev


Visit:

http://localhost:3000/tasks
