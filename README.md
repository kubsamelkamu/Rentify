# Rentify Client – Frontend

A **Next.js**, **TypeScript**, and **Redux Toolkit**–based frontend application that delivers a responsive, accessible,and real-time connected user interface for the Rentify platform. It provides:

1. **Property Listings**  
   Browse, search, and filter properties by city, price, and amenities.

2. **Authentication & Authorization**  
   Role‑based UI for Admins, Landlords, and Tenants using JWT.

3. **Booking System**  
   Create and manage bookings with real‑time status updates via Socket.IO.

4. **Payment Processing**  
   Integrates the Chapa payment gateway for secure transactions.

5. **Real‑time Chat**  
   Landlord–Tenant messaging powered by WebSockets.

6. **Reviews & Ratings**  
   Tenants can leave feedback and ratings for properties.

7. **Real-time Email Notifications**  
   Sends automated, real-time email alerts for booking confirmations, payment status, landlord approvals, and chat message alerts.

8. **Progressive Web App (PWA)**  
   Offline support, installable app, and push notifications.

## 📂 Project Structure
```
Rentify_client/
├── .env.local
├── .eslintrc.json
├── .gitignore
├── .hintrc
├── global.d.ts
├── next-env.d.ts
├── next.config.js
├── package.json
├── postcss.config.mjs
├── README.md
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── .github/
│   └── workflows/
├── .next/
│   ├── build-manifest.json
│   ├── package.json
│   ├── react-loadable-manifest.json
│   ├── trace
│   ├── cache/
│   ├── server/
│   └── static/
├── public/
│   ├── avatar.jpg
│   ├── cloud-solid.svg
│   ├── favicon.ico
│   ├── file.svg
│   ├── forgot_bg.jpg
│   ├── google.jpg
│   ├── hero.jpg
│   ├── login_bg.jpg
│   ├── manifest.json
│   ├── next.svg
│   ├── offline.html
│   ├── register-bg.jpg
│   ├── sw.js
│   └── workbox-e43f5367.js
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── admin/
│   │   ├── api/
│   │   ├── become-landlord.tsx
│   │   ├── bookings.tsx
│   │   ├── contact.tsx
│   │   ├── landlord/
│   │   ├── properties/
│   │   └── ...
│   ├── store/
│   │   ├── hooks.ts
│   │   ├── slices/
│   │   └── store.ts
│   ├── utils/
│   └── styles/
├── types/
```


## 🌐 Demo

🚀 Experience the live version of Rentify here:  
👉 [https://hrp-client.vercel.app](https://rentify-two-lilac.vercel.app/)


## 🛠️ Tech Stack

The Rentify Client is built with the following technologies:

- **Framework**: [Next.js](https://nextjs.org/) — React framework for production-ready applications.
- **Language**: [TypeScript](https://www.typescriptlang.org/) — typed superset of JavaScript.
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) — efficient, opinionated Redux setup.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) — utility-first CSS framework.
- **Real-time Communication**: [Socket.IO Client](https://socket.io/) — for real-time chat between a Landlord and Tenants ,  booking updates, payment status and like.
- **PWA Support**: Service workers and Web App Manifest for offline access and installability.
- **Form Validation & UI**: React Hook Form, Lucide Icons,axios, react-hot-toast, cloudinary and Framer Motio

## 📦 Prerequisites

Before running the Rentify Client locally, make sure you have the following installed:

- [Node.js](https://nodejs.org/) ≥ 16.x  
- npm, yarn, or pnpm (any one of your preferred package managers)  
- A running instance of the [Rentify Server](https://github.com/kubsamelkamu/rentify_server) backend API  
- PostgreSQL database 

## 📥 Installation

Follow these steps to set up and run the Rentify Client locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/kubsamelkamu/Rentify.git
2. **Navigate into the project directory**
    cd Rentify
3.**Install Project Dependencies**
   ``` bash 
    npm install
    # or
    yarn install
    # or
    pnpm install
    

4.  ** Create and configure environment variables**

Create a `.env.local` file in the project root directory and add the following variables:

```ini
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

5. **Run the development server**

Start the Next.js development server with the following command:

```bash
npm run dev

