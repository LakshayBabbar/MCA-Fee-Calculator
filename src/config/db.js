import mongoose from "mongoose";

export async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("Connected to DataBase Successfuly!");
    });
    connection.on("error", (err) => {
      console.log(err.message);
      process.exit();
    });
  } catch (error) {
    console.log(error.message);
  }
}
