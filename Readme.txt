=================================================
  PLAN MY TRIP - PROJECT USER MANUAL (README)
=================================================

This document provides all necessary instructions to set up, run, and test the PlanMyTrip full-stack web application software.

This project is a comprehensive MERN application (MongoDB, Express, React, Node.js) that connects travelers with 
verified local guides. It features an advanced, data-driven itinerary planner (using Geoapify and Wikipedia), 
real-time chat (Socket.io), a secure escrow payment system (Stripe), and phone verification (Twilio).

#TEAM MEMBERS

* RUSHIKESH DUSANE - IIT2024147 
* ARUN METRE       - IIT2024157  
* SHIVAM MALL      - IIT2024124  
* ANURAG ARBANE    - IIT2024156  
* JAYANT ESLAVATH  - IIT2024155  

# Git Repository Link of Our Project - https://github.com/RRD29/PlanMyTrip-SE-Project-.git

=================================================
  1. CORE FEATURES OF OUR SOFTWARE
=================================================

---
  1.1. User & Guide Management
---
* Role-Based Registration: Separate registration paths for Travelers (Users) and Guides.
* Secure Guide Verification (Admin-Only): Guides must upload critical documents (Aadhaar, PAN, Tourism License, 
  Police Verification) for admin approval. This information is private and visible only to the admin.
* Phone OTP Verification: Uses Twilio API to send and verify 6-digit codes to user/guide phone numbers during 
  profile setup.
* Role-Based Dashboards: Distinct, themed interfaces for Users (Blue), Guides (Green), and Admins (Red).

---
  1.2. Advanced Itinerary Planner (User interface , under Trip Planner tab)
---
* Smart Search: Users input a city, start/end dates, and a radius (in km).
* Geoapify Integration: The system automatically finds famous tourist places within that radius of the city's 
  main railway station.
* Rich Itinerary Data: The generated list includes place names and, where available, opening/closing times.
* Live Weather: The itinerary integrates a weather forecast for the planned destination on the scheduled dates.
* Wikipedia API: Users can click on any place name in the itinerary to view detailed information and photos 
  fetched from the Wikipedia API.
* Full Customization: The generated day-to-day schedule is fully editable, adjustable, and downloadable as a .txt file.
* Smart Guide Matching: A "Find Guides" button automatically filters the marketplace to show only guides whose 
  "Expertise Regions" match the planned destination.

---
  1.3. "Make a Trip" (Multi-City Planner)
---
* Custom Route Builder: Allows users to add multiple, random locations (e.g., "Prayagraj", "India gate", "Banaras") to create a 
  multi-stop trip.
* Route Visualization: Uses Geoapify to display all selected points on a map with connecting paths.
* Shortest Path Algorithm: A "Shortest Path" button uses the user's current GPS location to calculate and display 
  the most efficient route connecting all selected destinations in order.

---
  1.4. Explore Nearby Places
---
* An "Explore" feature that allows a user to enter any location and find nearby points of interest, categorized by 
  restaurants, parks, malls, and cafes.

---
  1.5. Booking, Chat, and Payments
---
* Live Chat: Real-time, room-based chat between a user and a guide for a specific booking (powered by Socket.io).
* Stripe Escrow System: Secure payment processing. A user's payment is held by the platform (admin) and only 
  released to the guide after both parties confirm the meetup by exchanging a unique OTP.
* Admin Control: Admins have full visibility and control over all users, guides, bookings, and financial transactions 
  through the MongoDB database

---
  1.6 Uploads and Forget password functionality
---
* Cloudinary Integration: Allows users and guides to securely upload and store profile photos and verification documents 
  (like Aadhaar, PAN) using Cloudinary's cloud storage.
* Forgot Password Flow: A secure password reset feature that sends a unique, time-limited reset link to the user's registered email address.

=================================================
  2. TECH STACK
=================================================

* Frontend: React.js , Tailwind CSS, React Router, Axios, Socket.io-client, React Router DOM
* Backend: Node.js, Express.js, Mongoose, Socket.io , JWT , Multer , Nodemailer , Twilio
* Database: MongoDB (using MongoDB Atlas)

* Key APIs & Services:
    * Geoapify: For maps, geocoding, route calculation, and "Places" search.
    * Wikipedia API: For fetching rich content about tourist spots.
    * Stripe API: For secure escrow payments and payouts.
    * Twilio API: For sending Phone/SMS OTP verification.
    * Weather API: For live weather forecasts in the itinerary.
    * Email Service (Nodemailer with Gmail SMTP): For sending email OTPs and notifications.
    * Socket.io: For real-time communication and notifications between users and guides.

You are right, a .txt file does not support bold formatting. Here is the final README.txt file with all markdown (**) removed and emphasis added using ALL CAPS.

=================================================
  PLAN MY TRIP - PROJECT USER MANUAL (README)
=================================================

This document provides all necessary instructions to set up, run, and test the PlanMyTrip full-stack web application.

This project is a comprehensive MERN application (MongoDB, Express, React, Node.js) that connects travelers with verified local guides. It features an advanced, data-driven itinerary planner (using Geoapify and Wikipedia), real-time chat (Socket.io), a secure escrow payment system (Stripe), and phone verification (Twilio).


=================================================
  1. CORE FEATURES
=================================================

---
  1.1. User & Guide Management
---
* Role-Based Registration: Separate registration paths for Travelers (Users) and Guides.
* Secure Guide Verification (Admin-Only): Guides must upload critical documents (Aadhaar, PAN, Tourism License, Police Verification) for admin approval. This information is private and visible only to the admin.
* Phone OTP Verification: Uses Twilio API to send and verify 6-digit codes to user/guide phone numbers during profile setup.
* Role-Based Dashboards: Distinct, themed interfaces for Users (Blue), Guides (Green), and Admins (Red).
* Cloudinary Integration: Allows users and guides to securely upload and store profile photos and verification documents using Cloudinary's cloud storage.
* Forgot Password Flow: A secure password reset feature that sends a unique, time-limited reset link to the user's registered email address.

---
  1.2. Advanced Itinerary Planner
---
* Smart Search: Users input a city, start/end dates, and a radius (in km).
* Geoapify Integration: The system automatically finds famous tourist places within that radius of the city's main railway station.
* Rich Itinerary Data: The generated list includes place names and, where available, opening/closing times.
* Live Weather: The itinerary integrates a weather forecast for the planned destination on the scheduled dates.
* Wikipedia API: Users can click on any place name in the itinerary to view detailed information and photos fetched from the Wikipedia API.
* Full Customization: The generated day-to-day schedule is fully editable, adjustable, and downloadable as a .txt file.
* Smart Guide Matching: A "Find Guides" button automatically filters the marketplace to show only guides whose "Expertise Regions" match the planned destination.

---
  1.3. "Make a Trip" (Multi-City Planner)
---
* Custom Route Builder: Allows users to add multiple, random locations (e.g., "Paris", "Berlin", "Rome") to create a multi-stop trip.
* Route Visualization: Uses Geoapify to display all selected points on a map with connecting paths.
* Shortest Path Algorithm: A "Shortest Path" button uses the user's current GPS location to calculate and display the most efficient route connecting all selected destinations in order.

---
  1.4. Explore Nearby Places
---
* An "Explore" feature that allows a user to enter any location and find nearby points of interest, categorized by restaurants, parks, malls, and cafes.

---
  1.5. Booking, Chat, and Payments
---
* Live Chat: Real-time, room-based chat between a user and a guide for a specific booking (powered by Socket.io).
* Stripe Escrow System: Secure payment processing. A user's payment is held by the platform and only released to the guide after both parties confirm the meetup by exchanging a unique OTP.
* Admin Control: Admins have full visibility and control over all users, guides, bookings, and financial transactions.


=================================================
  2. TECH STACK
=================================================

* Frontend: React, Tailwind CSS, React Router, Axios, Socket.io-client
* Backend: Node.js, Express.js, Mongoose, Socket.io
* Database: MongoDB (using MongoDB Atlas)
* Cloud Storage: Cloudinary (for file/image uploads)

* Key APIs & Services:
    * Geoapify: For maps, geocoding, route calculation, and "Places" search.
    * Wikipedia API: For fetching rich content about tourist spots.
    * Stripe API: For secure escrow payments and payouts.
    * Twilio API: For sending Phone/SMS OTP verification.
    * Weather API: For live weather forecasts in the itinerary.


=================================================
  3. AI/ML & ADVANCED ALGORITHMS
=================================================

This project implements a powerful data-driven algorithmic engine for travel planning, which serves as the foundation for future 
AI and ML enhancements.
---
  3.1. Current Algorithmic Features
---
The system does not use predictive AI models. Instead, it uses advanced data retrieval and algorithmic processing for its core features:
* Geospatial Queries (Geoapify): The Itinerary Planner uses complex geospatial queries. When a user provides a city and radius, 
  the system calculates the location of the main railway station and then algorithmically fetches real-world famous places (POIs) that fall within that specific geographic (X km) radius.
* Route Optimization (Shortest Path): The "Make a Trip" feature implements a classic computer science algorithm to calculate the 
  most efficient, shortest path between a user's current location and multiple selected destinations.
* Data Retrieval (Wikipedia API): The system enriches the itinerary by connecting to the Wikipedia API, parsing its data to extract
  and display relevant, real-world photos and textual information about specific locations.

---
  3.2. Future AI/ML Scope
---
The data collected by this system is perfectly structured to be fed into AI and ML models for future enhancements:

* MACHINE LEARNING (Recommender System): The user data (travel style, food preferences, budgets) and booking history (past trips) 
  can be used to train an ML model. This model could power a "Personalized Recommendations" feature, suggesting specific guides, cities, or restaurants that a user is statistically likely to enjoy.
* GENERATIVE AI (Smart Itinerary): The list of places, opening times, and weather data can be fed into a Generative AI model 
  (like an LLM API) to write a full, human-like, descriptive travel plan.

=================================================
  4. PRE-REQUISITES (SOFTWARE TO INSTALL)
=================================================

* Node.js: (v18.x or later recommended).
* npm (or yarn): The package manager for Node.js.

 (Below PRE-REQUISITES optional if you want personalised database and other then you can do it , otherwise withot it still program will work)
* MongoDB Atlas Account: To get your database connection string (MongoDB database is connected to admin account(rushird2974@gmail.com))
* Geoapify Account: To get an API key for all mapping features.
* Stripe Account: To get API keys for payments.
* Twilio Account: To get an Account SID, Auth Token, and Twilio Phone Number for OTPs.
* Code Editor: Visual Studio Code is recommended.
* mongosh (Optional): The MongoDB Shell, to inspect the database from your terminal.

=================================================
  5. CREDENTIALS & ENVIRONMENT SETUP  (optional)
=================================================

This project requires two separate '.env' files.I have given my own .env files for fast set up and direct running. 
Please don't share them with anyone they are highly confidential.

If you want your personalised database and API keys then 
---
  5.1. Backend Credentials (server/.env)
---
Create a file named `.env` inside the /server folder.

  - MONGODB_URI:
    * What it is: Your database connection string.
    * How to get it:
        1.  Log in to MongoDB Atlas and create a free (M0) cluster.
        2.  Go to "Database Access" and create a database user (e.g., myUser / myPassword123).
        3.  Go to "Network Access" and click "Add IP Address" -> "Allow Access from Anywhere" (0.0.0.0/0).
        4.  Click "Connect" on your cluster, select "Drivers," and copy the Node.js connection string.
    * Example: MONGODB_URI=mongodb+srv://myUser:myPassword123@cluster0.xxxxx.mongodb.net/planmytrip?retryWrites=true&w=majority

  - JWT_SECRET:
    * What it is: A secret key for signing login tokens.
    * How to get it: Create a long, random string.
    * Example: JWT_SECRET=my_super_secret_key_for_jwt_tokens_12345

  - CORS_ORIGIN: (The URL your React client is running on)
    * Value: CORS_ORIGIN=http://localhost:8001 (or 3000, 3001, etc.)

  - Stripe API (Secret Key):
    * Value: STRIPE_SECRET_KEY=sk_test_...

  - Twilio API:
    * TWILIO_ACCOUNT_SID=AC...
    * TWILIO_AUTH_TOKEN=...
    * TWILIO_PHONE_NUMBER=+1... (Your Twilio phone number)

  - Email (for Notifications / Password Reset):
    * EMAIL_HOST=smtp.gmail.com
    * EMAIL_PORT=587
    * EMAIL_USER=your-email@gmail.com
    * EMAIL_PASS=your16characterapppassword

---
  5.2. Frontend Credentials (client/.env)
---
Create a file named `.env` inside the /client folder.

  - REACT_APP_GEOAPIFY_API_KEY:
    * Example: REACT_APP_GEOAPIFY_API_KEY=your_geoapify_key_here...

  - REACT_APP_STRIPE_PUBLISHABLE_KEY:
    * Example: REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...

  - REACT_APP_WEATHER_API_KEY: (If you are using a 3rd party weather API)
    * Example: REACT_APP_WEATHER_API_KEY=your_weather_api_key...


=================================================
  6. STEP-BY-STEP EXECUTION INSTRUCTIONS (Must , to run project)
=================================================

You must run the backend and frontend in two separate terminals.

---
  6.1. Terminal 1: Start the Backend (Server)
---

  1.  Navigate to the /server directory:
      `cd path/to/project/server`
  2.  Install all packages:
      `npm install`
  3.  Start the server:
      `npm run dev`
  4.  WAIT for the success message:
      "MongoDB connected! DB HOST: ..."
      "Server is running on port: 8000"
      "Socket.io is active."

---
  6.2. Terminal 2: Start the Frontend (Client)
---

  1.  Open a NEW terminal.
  2.  Navigate to the /client directory:
      `cd path/to/project/client`
  3.  Install all packages:
      `npm install` (or `yarn install`)
  4.  Start the React application:
      `npm start` (or `yarn start`)
  5.  Your browser will open to your client URL (e.g., `http://localhost:8001`).

The application is now fully running.

---
  6.3. Troubleshooting:
---
- If npm install fails, try deleting node_modules and package-lock.json, then run npm install or yarn install or yarn add 
   react-scripts in client folder again.
- If the client doesn't start, ensure port 8000 is free.
- For database issues, check MongoDB connection string and ensure the database is accessible.

=================================================
  7. PROJECT USAGE & TEST ACCOUNTS
=================================================

---
  7.1. Test Accounts
---

Please use the "Sign Up" page to create test accounts.

* To Test Traveler Flow:
    1.  Click "Sign Up" and select the "Traveler" role.
    2.  You will be logged in and redirected to the User Dashboard (/dashboard).
    3.  Go to "View Profile" to add your traveler preferences.

* To Test Guide Flow:
    1.  Click "Sign Up" and select the "Guide" role.
    2.  You will be logged in and redirected to the Guide Profile setup page (/dashboard-guide/profile).
    3.  THIS IS A REQUIRED STEP: You must fill out all required fields (*) and upload your documents (Aadhaar, PAN, etc.) and click "Complete Profile".
    4.  Once the profile is complete, you will be redirected to the Guide Dashboard, and your profile will be visible to Travelers in the "Find Guides" marketplace.

---
  7.2. Creating an Admin
---

  1.  Register a new user normally (e.g., admin@test.com).
  2.  Open MongoDB Atlas and "Browse Collections" (or use `mongosh`).
  3.  Open the `users` collection.
  4.  Find the `admin@test.com` document.
  5.  Manually change the `role` field from "user" to "admin".
  6.  Log in as `admin@test.com`. You will be redirected to the Admin Dashboard (/dashboard-admin).

=================================================
  8. CONTACT
=================================================
For issues or questions, refer to the project repository or contact the development team.
* Git Repo - https://github.com/RRD29/PlanMyTrip-SE-Project-.git
* Email to contact - rushird2974@gmail.com 
* Phone Number- 9284907504