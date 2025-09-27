# GoodFood Frontend 🍔💻
<p align="center"> 
  <img src="https://raw.githubusercontent.com/dquang0504/GoodFood-FE/main/GoodFood-FE/src/assets/images/GoodFood-FE-cover.png" alt="GoodFood Frontend Banner" width="450" /> 
</p> 
<h3 align="center"> 
  <i>Delicious UI for a seamless online food ordering experience</i> 
</h3> 
<p align="center"> 
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-blue" /></a> 
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-blue" /></a> 
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-3-blue" /></a> 
  <a href="https://redux.js.org/"><img src="https://img.shields.io/badge/Redux-Toolkit-blueviolet" /></a> 
  <a href="https://github.com/dquang0504/GoodFood-FE/actions"> <img src="https://github.com/dquang0504/GoodFood-FE/actions/workflows/fe-ci.yml/badge.svg" alt="CI Status"/> </a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" /></a> 
</p>

Frontend for GoodFood, an e-commerce website specialized in online food ordering and delivery.
This repository implements a modern, responsive UI with smooth animations and real-time updates.

---

## ✨ Features
 
* Responsive design with TailwindCSS & React Bootstrap

* Product browsing with image gallery (Lightbox integration)

* Shopping cart with Redux state management

* Checkout flow with integrated Google OAuth

* Real-time messaging with SockJS

* Firebase for authentication and notifications

* Firebase storage for storing media files

* Smooth UI transitions with Framer Motion

---

## 🛠️ Tech Stack

* Language: TypeScript

* Framework: React

* UI & Styling: TailwindCSS, React Bootstrap

* State Management: Redux Toolkit

* Animations: Framer Motion

* Realtime: SockJS

* Auth & Backend Services: Firebase, Google OAuth

* Build Tooling: Vite / Webpack

---

## 📂 Project Structure
```bash
GoodFood-FE/
├── public/            # Static assets
├── src/
│   ├── dist/          # Build files.
│   ├── assets/        # Images, icons, etc.
│   ├── components/    # Reusable UI components
│   ├── slices/        # Redux slices & feature modules
│   ├── hooks/         # Custom React hooks
│   ├── interfaces/    # Model interfaces for type safe
│   ├── services/      # API calls & Firebase integration
│   ├── store/         # Redux store setup
│   ├── App.tsx        # Root component
│   └── main.tsx       # App entrypoint
├── package.json
├── tsconfig.json
├── vite.config.ts     # or webpack.config.js
└── README.md
```

---

## ⚙️ Getting Started
## Prerequisites

Node.js 18+

npm / yarn / pnpm

## Installation
```bash
# Clone the repository
git clone https://github.com/dquang0504/GoodFood-FE.git
cd GoodFood-FE

## Install dependencies
npm install
```

## Running Locally
```bash
# Start dev server
npm run dev
```

The app will be available at: 👉 http://localhost:5173
 (or at a different port, depends on the config)

 ---

 ## 🔑 Environment Variables

Create a .env file in the root directory:
```bash
VITE_API_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_API_GHN=your_api_ghn_key
```

---

## 🚀 Deployment

* Optimized build with:
```bash
npm run build
```

* Can be deployed on Vercel, Netlify, or Firebase Hosting.

CI/CD setup via GitHub Actions (to be added).

---

## 🤝 Contributing

We welcome contributions!

Fork the repository

Create a new branch (feature/my-feature)

Commit your changes (git commit -m 'Add feature')

Push the branch & open a Pull Request

Please follow React + TypeScript best practices.

---

## 📜 License

Distributed under the MIT License. See LICENSE for more information.
