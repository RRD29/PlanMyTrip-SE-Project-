PLAN MY TRIP – Full Stack MERN Project

Plan My Trip is a full-stack MERN web application that connects travelers with verified local guides and helps users plan smart, customized trips using real-world data and modern web technologies.

The platform provides itinerary planning, multi-city route creation, nearby place exploration, real-time chat, secure payments, and guide booking — all in one place.

Core Features
1. User & Guide Management

Role-based registration for Travelers, Guides, and Admins

Secure guide verification (Aadhaar, PAN, Tourism License, Police Verification)

Phone OTP verification using Twilio

Separate dashboards for User, Guide, and Admin

Profile photo & document uploads using Cloudinary

Secure forgot-password functionality via email

2. Advanced Itinerary Planner

City-based trip planning with date range and radius selection

Tourist place discovery using Geoapify

Opening/closing time information (when available)

Live weather integration for travel dates

Wikipedia integration for place details and images

Editable day-wise itinerary downloadable as a .txt file

Smart guide matching based on destination expertise

3. Make a Trip (Multi-City Planner)

Add multiple locations to create a custom route

Map-based route visualization

Shortest path calculation using the user’s current location

4. Explore Nearby Places

Discover nearby restaurants, parks, malls, and cafes for any location

5. Booking, Chat & Payments

Real-time chat between user and guide using Socket.io

Secure Stripe escrow payment system

OTP-based meetup confirmation before payment release

Full admin control over users, bookings, and transactions

🧰 Tech Stack
Frontend

React.js

Tailwind CSS

React Router

Axios

Socket.io-client

Backend

Node.js

Express.js

MongoDB & Mongoose

JWT Authentication

Socket.io

Multer & Nodemailer

APIs & Services

Geoapify (Maps, routes, places)

Wikipedia API (Place details)

Stripe API (Secure payments)

Twilio API (Phone OTP verification)

Weather API (Live forecasts)

Cloudinary (Image & document uploads)

⚙️ Prerequisites

Node.js (v18 or later recommended)

npm or yarn

Code editor (VS Code recommended)

Optional (for personal setup):

MongoDB Atlas account

Geoapify API key

Stripe account

Twilio account

▶️ How to Run the Project
1. Start Backend (Server)
cd server
npm install
npm run dev


Wait for:

MongoDB connected

Server running on port 8000

Socket.io active

2. Start Frontend (Client)
cd client
npm install
npm start


Open browser at:

http://localhost:8001

🧪 Testing the Application
Traveler

Sign up as Traveler

Complete profile

Create itineraries, explore places, book guides

Guide

Sign up as Guide

Complete profile and upload verification documents

Become visible to travelers after approval

Admin

Create a normal account

Change role to admin in MongoDB

Access admin dashboard to manage users, guides, and payments

📌 Future Scope (AI & ML)

Personalized travel recommendations using ML

AI-generated detailed itineraries using user preferences

Smart guide and destination suggestions

📞 Contact

GitHub: https://github.com/RRD29/PlanMyTrip-SE-Project-.git

Email: rushird2974@gmail.com

Phone: 9284907504