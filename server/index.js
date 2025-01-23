import express from 'express';
import cors from 'cors';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
    res.status(200).json({
    message: "Welcome to the API",
   });
});

app.get('/api', (req, res) => {
    res.send('Hello from API!');
    });

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});


    