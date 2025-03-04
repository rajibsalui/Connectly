export const config = {
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000/api',
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000/api',
  clientUrl: process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000/api',
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  }
};