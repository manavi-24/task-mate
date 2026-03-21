## 🚀 TaskMate


TaskMate is a task coordination system built to model a hostel-level micro-economy, where users can post tasks, accept work, and complete them through a structured and secure workflow. Tasks move through strictly controlled states and user actions are governed by role-based constraints and validated transitions.

---

## 💡 Problem

In hostel environments, students frequently need help with small tasks like cooking, cleaning, errands, or academic work.

However, there is **no structured, reliable system** to:
- Request help  
- Find trustworthy people  
- Track task progress  
- Ensure accountability  

---

## 🎯 Solution

TaskMate provides a **controlled, state-driven system** where:

- Users can post and accept tasks  
- Each task follows a **strict lifecycle**  
- Actions are **role-restricted** (Creator vs Acceptor)  
- Communication is **secure and conditional**  
- Payments are tracked before closure  

---

## 🧠 System Design (Core Highlight)

TaskMate is built as a **state-driven workflow system** with strict validation.

### 🔁 Task Lifecycle

open → accepted → in_progress → work_done → payment_pending → payment_received → closed

### ✅ Key Guarantees

- No step skipping  
- No unauthorized actions  
- Clear ownership at each stage  
- Automatic task closure after payment  

---

## 🔐 Access Control & Security

- Role-based API protection (Creator / Acceptor)  
- Chat access only after task acceptance  
- Controlled state transitions via backend validation  

---

## 🔄 How It Works

1. User posts a task with details (category, price, deadline, location)  
2. Another user accepts the task  
3. A private chat channel is unlocked between both users  
4. Task progresses through lifecycle stages  
5. Creator selects payment method  
6. Acceptor confirms payment  
7. Task is marked as closed by the creator.

---

## 🌟 Key Features

### 👤 Authentication
- Google Authentication using NextAuth  
- Secure session handling  

### 📝 Task Creation
- Title, description, category, price  
- Hostel & room number  
- Optional deadline (date + time)  
- Auto-attached user details (name, email, avatar)  

### 📊 Dashboard
- Posted tasks (as Creator)  
- Accepted tasks (as Acceptor)
- Active tasks 
- Earnings tracking  
- Real-time lifecycle updates  

### 🔍 Browse Tasks
- Filter by category & hostel  
- Sort by nearest deadline  
- Expired tasks auto-hidden  
- "Expiring Soon" indicators  

### 💬 Conditional Messaging
- Chat enabled only after task acceptance  
- Online/offline status visibility  

### 💰 Payment Handling
- Payment methods: Cash / UPI   
- Payment status tracking  

---

## 🧱 Tech Stack

### Frontend
- Next.js (App Router)  
- React
- TypeScript
- Tailwind CSS  

### Backend
- Next.js API Routes  
- Firebase Firestore  
- Firebase Admin SDK  

### Authentication
- NextAuth.js  
- Google Provider  

### Deployment
- Vercel  

---

## 🧠 Engineering Highlights

- Role-based API protection  
- Strict lifecycle validation system  
- State-driven architecture  
- Firestore timestamp serialization handling  
- Defensive UI (fallbacks, expired task handling)    
- Server-side filtering for accuracy and performance  

---

## 🚀 Future Improvements

- Ratings & trust system  
- User analytics (earnings, completion rate)  
- Smart task recommendations  
- Real payment gateway integration (Razorpay/Stripe)  

---

## 🔗 Live Demo

https://task-mate-five-eta.vercel.app/

---


## 🙌 Author

**Manavi Sharma**  
NIT Hamirpur  
