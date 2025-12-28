
# 🌍 PLAN MY TRIP  
### Smart Travel Planning & Guide Booking Platform

> A full-stack MERN application that connects travelers with **verified local guides** and helps users create **smart, data-driven itineraries** using real-world APIs.

---

## ✨ Highlights
- Advanced itinerary planning with maps, weather & Wikipedia data  
- Verified local guide marketplace  
- Real-time chat & secure escrow payments  
- Multi-city route planning with shortest path logic  

---

## 👥 Team Members

| Name | Roll No |
|-----|--------|
| Rushikesh Dusane | IIT2024147 |
| Arun Metre | IIT2024157 |
| Shivam Mall | IIT2024124 |
| Anurag Arbane | IIT2024156 |
| Jayant Eslavath | IIT2024155 |

🔗 **GitHub Repository**  
https://github.com/RRD29/PlanMyTrip-SE-Project-.git

---

## 🚀 Core Features

### 👤 User & Guide Management
- Role-based registration (Traveler / Guide / Admin)
- Secure guide verification (Aadhaar, PAN, Tourism License, Police Verification)
- Phone OTP verification using Twilio
- Separate dashboards for each role
- Cloudinary-based image & document uploads
- Secure forgot-password via email

---

### 🗺️ Advanced Itinerary Planner
- City, date-range & radius-based search
- Tourist place discovery using Geoapify
- Live weather integration
- Wikipedia-powered place details & images
- Fully editable day-wise itinerary
- Download itinerary as `.txt`
- Smart guide matching by destination

---

### 🧭 Make a Trip (Multi-City Planner)
- Add multiple locations to create a custom route
- Visual route rendering on maps
- Shortest path calculation using current GPS location

---

### 🔍 Explore Nearby Places
- Discover restaurants, parks, malls & cafes near any location

---

### 💬 Booking, Chat & Payments
- Real-time user–guide chat with Socket.io
- Secure Stripe escrow payment system
- OTP-based meetup confirmation
- Complete admin control over users & transactions

---

## 🧰 Tech Stack

### Frontend
- React.js  
- Tailwind CSS  
- React Router  
- Axios  
- Socket.io-client  

### Backend
- Node.js  
- Express.js  
- MongoDB & Mongoose  
- JWT Authentication  
- Socket.io  
- Multer & Nodemailer  

### APIs & Services
- Geoapify (Maps & routes)
- Wikipedia API (Place details)
- Stripe API (Payments)
- Twilio API (Phone OTP)
- Weather API
- Cloudinary (Uploads)

---

## ⚙️ Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Visual Studio Code

Optional:
- MongoDB Atlas
- Geoapify API Key
- Stripe Account
- Twilio Account

---

## ▶️ How to Run the Project

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm start
```

Open browser at:
```
http://localhost:8001
```

---

## 🧪 Testing Roles

### Traveler
- Sign up → Create itineraries → Book guides

### Guide
- Sign up → Upload documents → Get approved → Accept bookings

### Admin
- Change role to `admin` in MongoDB
- Manage users, guides & payments

---

## 🔮 Future Scope
- ML-based personalized travel recommendations
- AI-generated smart itineraries
- Intelligent guide & destination suggestions

---

## 📞 Contact
- **GitHub:** https://github.com/RRD29/PlanMyTrip-SE-Project-.git  
- **Email:** rushird2974@gmail.com  
- **Phone:** 9284907504  

---

⭐ If you like this project, give it a star!
