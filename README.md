# Connectly - Real-time Chat & Video Calling Application

A modern chat application built with Next.js that enables real-time messaging, voice calls, and video calls with AI-powered features.

## Features

- 💬 Real-time chat messaging
- 📞 Voice calling
- 🎥 Video calling
- 🎨 Multiple themes
- 👤 User authentication
- 🔒 Secure communications
- 🤖 AI-powered chat assistance
- 📱 Responsive design
- 🌐 Status updates
- 👥 Contact management

## Technology Stack

- **Frontend:**
  - Next.js 13 (App Router)
  - TypeScript
  - Tailwind CSS
  - Socket.io Client
  - React Icons

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB
  - Socket.io
  - Firebase
  - Hugging Face AI (Mistral-7B-Instruct-v0.3)

## Prerequisites

Before running this project, make sure you have:

- Node.js (v18 or higher)
- MongoDB
- Firebase account
- Hugging Face API key

## Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/connectly.git
cd connectly
````
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

## Project Structure

```
connectly/
├── client/                 # Frontend Next.js application
│   ├── src/
│   │   ├── app/           # Next.js 13 app directory
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   └── assets/        # Static assets
│   └── public/            # Public assets
│
└── server/                # Backend Node.js application
    ├── config/           # Configuration files
    ├── controllers/      # Route controllers
    ├── models/          # Database models
    ├── routes/          # API routes
    └── services/        # Business logic
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
