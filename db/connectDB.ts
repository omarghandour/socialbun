import mongoose from "mongoose";

const connectDB = async () => {
  const en: any = process.env.MONGO_URI;
  try {
    await mongoose.connect(en);
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
export default connectDB;
