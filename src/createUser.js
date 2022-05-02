import mongoose from "mongoose";
import { createUser } from "./models/User";
import { mongoUrl } from "./config";

const main = async () => {
  await mongoose.connect(mongoUrl);
  try {
    const user = await createUser({
      name: "Sostene MUnezero Bagira",
      email: "bagira.sostenee@gmail.com",
      username: "password123",
      password: "password123",
      role: "admin",
    });
    if (user) console.log("User created successfully");
  } catch (err) {
    console.log("Admin already exists");
  }
};
main();
