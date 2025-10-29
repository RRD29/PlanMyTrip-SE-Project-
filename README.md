# ✈️ PlanMyTrip Platform

A comprehensive trip planning platform that securely connects travelers with local guides, featuring a guide marketplace, role-based dashboards, and a secure escrow payment system.

## ✨ Core Features

* **Role-Based Dashboards:** Separate interfaces for Users, Guides, and Admins.
* **Guide Marketplace:** Browse, filter, and view profiles of registered guides.
* **Secure Escrow Payments:** Powered by **Stripe**, payments are held by the admin until the trip is confirmed.
* **OTP-Verified Meetups:** A secure 2-way OTP exchange releases the payment from escrow to the guide.
* **Trip Planner:** An interactive tool using Google Maps for users to plan itineraries.
* **Authentication:** Secure JWT (JSON Web Token) authentication.
* **Review System:** Users can rate and review guides after a completed trip.

## 🛠️ Tech Stack

* **Frontend:** React, Tailwind CSS, React Router, Axios, Stripe.js
* **Backend:** Node.js, Express.js, Mongoose
* **Database:** MongoDB (using MongoDB Atlas)
* **Payments:** Stripe (for Payment Intents and Escrow)
* **Email:** Nodemailer (for OTP and booking notifications)
* **Maps:** Google Maps JavaScript API & Places API

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

* **Node.js** (v18 or later)
* **MongoDB Atlas** account (for your `MONGODB_URI`)
* **Stripe** account (for your API keys)
* **Google Cloud** account (for your Google Maps API key)
* **Gmail** account (for your `EMAIL_PASS` App Password)

---

### 1. Server Setup (Backend)

1.  Navigate to the server directory:
    ```bash
    cd server
    ```

2.  Install all required packages:
    ```bash
    npm install
    ```

3.  Create an environment file:
    ```bash
    touch .env
    ```

4.  Add your secret keys to **`server/.env`**:
    ```env
    # Database
    MONGODB_URI=mongodb+srv://...

    # Security
    JWT_SECRET=your_super_strong_jwt_secret

    # Stripe (Secret Key)
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...

    # Email (Nodemailer)
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your_16_digit_gmail_app_password
    
    # Frontend URL
    CLIENT_URL=http://localhost:3000
    ```

5.  Run the server:
    ```bash
    npm run dev
    ```
    *(The server will be running on `http://localhost:8000`)*

---

### 2. Client Setup (Frontend)

1.  Open a **new terminal** and navigate to the client directory:
    ```bash
    cd client
    ```

2.  Install all required packages:
    ```bash
    npm install
    ```

3.  Create an environment file:
    ```bash
    touch .env
    ```

4.  Add your public keys to **`client/.env`**:
    ```env
    # Google Maps (Public Key)
    REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSy...

    # Stripe (Publishable Key)
    REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
    ```

5.  Run the client:
    ```bash
    npm start
    ```
    *(The app will automatically open in your browser at `http://localhost:3000`)*