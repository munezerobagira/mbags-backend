import mongoose from "mongoose";
import { createUser } from "./models/User";
import { mongoUrl } from "./config";

const main = async () => {
  await mongoose.connect(mongoUrl);
  try {
    const user = await createUser({
      name: "Sostene MUnezero Bagira",
      email: "dev@dev.dev",
      username: "iamdev",
      password: "iamdev",
      role: "admin",
      verified: true,
    });
    mongoose.disconnect();
    if (user) console.log("User created successfully", user);
  } catch (err) {
    console.log("Admin already exists");
  }
};
main();

