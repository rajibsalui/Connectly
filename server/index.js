import express from 'express';
import cors from 'cors';
import connectDB from './config/db.config.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT ;

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
    res.status(200).json({
    message: "Welcome to the API",
   });
});


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