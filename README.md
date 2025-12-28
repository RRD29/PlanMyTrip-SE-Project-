
# PLAN MY TRIP  
### Smart Travel Planning & Guide Booking Platform

> A full-stack MERN application that connects travelers with **verified local guides** and helps users create **smart, data-driven itineraries** using real-world APIs.

---

## Problem Statement
Travel planning today faces several critical challenges:
- Difficulty in creating efficient and well-structured travel itineraries
- Lack of reliable and verified local guides for travelers
- Fragmented use of multiple platforms for planning, booking, and communication
- Limited real-time information about weather, places, and routes
- Poor coordination and communication between travelers and local guides
- Manual and time-consuming trip customization processes
These challenges result in inefficient trip planning, increased traveler uncertainty, safety concerns, and a poor overall travel experience.

---

## Core Features

### 1.User & Guide Management
- Role-based registration (Traveler / Guide / Admin)
- Secure guide verification (Aadhaar, PAN, Tourism License, Police Verification)
- Phone OTP verification using Twilio
- Separate dashboards for each role
- Cloudinary-based image & document uploads
- Secure forgot-password via email

### 2.Advanced Itinerary Planner
- City, date-range & radius-based search
- Tourist place discovery using Geoapify
- Live weather integration
- Wikipedia-powered place details & images
- Fully editable day-wise itinerary
- Download itinerary as `.txt`
- Smart guide matching by destination

### 3.Make a Trip (Multi-City Planner)
- Add multiple locations to create a custom route
- Visual route rendering on maps
- Shortest path calculation using current GPS location

### 4.Explore Nearby Places
- Discover restaurants, parks, malls & cafes near any location

### 5.Booking, Chat & Payments
- Real-time user–guide chat with Socket.io
- Secure Stripe escrow payment system
- OTP-based meetup confirmation
- Complete admin control over users & transactions

---

## Tech Stack

### 1.Frontend
- React.js  
- Tailwind CSS  
- React Router  
- Axios  
- Socket.io-client  

### 2.Backend
- Node.js  
- Express.js  
- MongoDB & Mongoose  
- JWT Authentication  
- Socket.io  
- Multer & Nodemailer  

### 3.APIs & Services
- Geoapify (Maps & routes)
- Wikipedia API (Place details)
- Stripe API (Payments)
- Twilio API (Phone OTP)
- Weather API
- Cloudinary (Uploads)
- Email API (For password reset emails)

---

## Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Visual Studio Code

Optional:
- MongoDB Atlas
- Geoapify API Key
- Stripe Account
- Twilio Account

---

## How to Run the Project

### 1.Backend
```bash
cd server
npm install
npm run dev
```

### 1.Frontend
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

## Testing Roles

### 1.Traveler
- Sign up → Create itineraries → Book guides

### 2.Guide
- Sign up → Upload documents → Get approved → Accept bookings

### 3.Admin
- Change role to `admin` in MongoDB
- Manage users, guides & payments

---

## Future Scope
- ML-based personalized travel recommendations
- AI-generated smart itineraries
- Intelligent guide & destination suggestions
- Premimum guide options (Application , selection , booking)

---
