import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './config/db.config.js';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes.js';
import createHttpError from 'http-errors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import expresssession from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';
import User from './models/user.model.js';
import path from 'path';
import chatRoutes from './routes/chat.routes.js';
import { configureSocket } from './config/socket.config.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const serverPort = process.env.PORT || 5000; // Server port
const clientPort = 3000; // Client port

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// view engine setup
const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expresssession({
   secret: process.env.JWT_SECRET || "secret-key",
   resave: false,
   saveUninitialized: false,
   cookie: {
     secure: process.env.NODE_ENV === 'production',
     httpOnly: true,
     maxAge: 24 * 60 * 60 * 1000 // 24 hours
   }
 })); 
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
   done(null, user.id); // or any unique identifier
 });
 
 passport.deserializeUser(async (id, done) => {
   const user = await User.findById(id);
   done(null, user);
 });
app.use(flash());

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes

app.get("/", async (req, res) => {
    res.status(200).json({
    message: "Welcome to the API",
   });
});

app.use("/users",userRoutes);
app.use('/chat', chatRoutes);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: corsOptions
});

configureSocket(io);

const startServer = async () => {
    try {
        await connectDB(); // Connect to database first
        
        // Start the server
        httpServer.listen(serverPort, () => { 
            console.log(`Server running at http://localhost:${serverPort}`);
            console.log(`Socket.IO listening for connections`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
};

// Start the server
startServer().catch(console.error);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
   next(createError(404));
 });
 
// Error handler
app.use(function(err, req, res, next) {
  console.error(err.stack);
  
  // Handle API errors with JSON response
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  }

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;