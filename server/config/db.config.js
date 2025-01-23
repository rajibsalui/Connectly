
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// database connection configuration for mongodb
const connectDB = async () => {
    mongoose.set("strictQuery", true);
    mongoose
      .connect(process.env.MONGODB_URL)
      .then(() => console.log("Connected to the database"))
      .catch((error) => console.log("Error connecting to the database: ", error));
  };

export default connectDB ;