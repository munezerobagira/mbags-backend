import mongoose from "mongoose";
import { createUser } from "./models/User";
import { mongoUrl } from "./config";

const main = async () => {
  await mongoose.connect(mongoUrl);
  const user = await createUser({
    name: "Super User",
    email: "admin@superuser.com",
    username: "admin",
    password: "super@123",
    role: "admin",
  });
  if (user) console.log("User created successfully");
  process.exit(1);
};
main();
