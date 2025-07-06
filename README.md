💖 MotherLine – Digital Health Tool for Women
A secure and user-friendly web platform designed to empower women by simplifying medical data management and improving access to health records.

🔍 Project Overview:
MotherLine enables users (patients) to:

Register and log in securely using JWT authentication

Upload PDF or JPG medical reports (with a 5MB limit)

Store medical file metadata (upload date, file type, user info) in Firebase

View and manage their health documents from an intuitive dashboard

🛠️ Tech Stack:
Frontend: React.js (Vite), Tailwind CSS, Axios

Backend: Firebase 

Database: Firebase Firestore

Authentication: JSON Web Tokens (JWT)

Storage: Firebase Storage

WomenWellness/
├── client/           # React frontend
│   ├── src/
│   └── public/
├── server/           # Express backend with Firebase integration
│   └── routes/
├── .env              # Environment variables
└── README.md

🚀 Features:
🔐 Secure user authentication (JWT)

📤 Upload PDF/JPG files (max 5MB)

🗃️ Metadata storage in Firebase (timestamp, user, file details)

🖼️ File preview support

🌐 Mobile-friendly and responsive design

Project Run Steps 
cd WomenWellness
cd client && npm install
npm install cross-env --save-dev 
cd ../server && npm install

# In client
npm run dev

# In server
npm run dev


