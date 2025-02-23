export const config = {
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000',
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
  clientUrl: process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000',
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  }
};