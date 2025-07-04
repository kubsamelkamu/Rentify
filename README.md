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
│   │  
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
👉 [Rentify](https://rentify-two-lilac.vercel.app/)


## 🛠️ Tech Stack

The Rentify Client is built with the following technologies:

- **Framework**: [Next.js](https://nextjs.org/) — React framework for production-ready applications.
- **Language**: [TypeScript](https://www.typescriptlang.org/) — typed superset of JavaScript.
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) — efficient, opinionated Redux setup.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) — utility-first CSS framework.
- **Real-time Communication**: [Socket.IO Client](https://socket.io/) — for real-time chat between a Landlord and Tenants ,  booking updates, payment status and like.
- **PWA Support**: Service workers and Web App Manifest for offline access and installability.
- **Form Validation & UI**: React Hook Form, Lucide Icons and Framer Motion.
- **HTTP & Notifications**: Axios, react-hot-toast, Cloudinary SDK.

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
   ```
2. **Navigate into the project directory**
   ```bash
    cd Rentify
    ```
3.**Install Project Dependencies**
   ```bash 
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
4. ** Create and configure environment variables**

Create a `.env.local` file in the project root directory and add the following variables:

```ini
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 📜 Available Scripts

In the project directory, you can run:

### `npm run dev`
Starts the development server at [http://localhost:3000](http://localhost:3000).

```bash
npm run dev
```
## `npm run build`
Builds the application for production to the .next/ folder.
## `npm start`
Runs the compiled production build.
## `npm run lint`
Checks the code for linting errors using ESLint.
## `npm run type-check`
Runs TypeScript type checking 
## `npm run test`
Runs the test suite 

## 🤝 Contributing

To contribute to the Rentify Client project, please follow these steps:

1. **Fork** the repository  
   Click the “Fork” button in the top-right corner of the GitHub page.

2. **Clone** your fork locally  
   ```bash
   git clone https://github.com/kubsamelkamu/Rentify.git
   cd Rentify
   ```
3.Create a feature branch
   ``` bash 
   git checkout -b feature/my-new-feature
   ```
4.Install dependencies and run the project
   ``` bash
   npm install
   npm run dev
   ```
5.Implement your changes
   Follow existing coding style and conventions.

   Add tests for new functionality.

   Ensure ESLint and type-check pass locally:
   ```bash
      npm run lint
      npm run type-check
   ```
6.Commit your changes
   ```bash 
   git add .
   git commit -m "feat: describe your feature here"
   ```
7.Push to your fork
   ```bash
      git push origin feature/my-new-feature
   ```
8.Open a Pull Request
   Go to the original Rentify Client repository.

   Click “New Pull Request” and select your branch.

   Provide a clear title and description.
9.Review process
   Respond to review comments.

   Make any requested changes.

   Once approved, your PR will be merged.
