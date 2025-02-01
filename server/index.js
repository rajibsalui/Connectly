import express from 'express';
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



dotenv.config();

const app = express();
const port = process.env.PORT ;
const corsOptions = {
   origin: 'http://localhost:3000',
   credentials: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization']
 };
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// view engine setup
const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

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


const startServer= async ()=>{
    try {
        app.listen(port, () => {
        connectDB();
        console.log(`Server listening at http://localhost:${port}`);
        });
     } catch (error) {
        console.log("Error starting server:",error);
   }
};

startServer();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
   next(createError(404));
 });
 
 // error handler
 app.use(function(err, req, res, next) {
   // set locals, only providing error in development
   res.locals.message = err.message;
   res.locals.error = req.app.get('env') === 'development' ? err : {};
 
   // render the error page
   res.status(err.status || 500);
   res.render('error');
 });