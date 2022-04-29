import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../models";

passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, "Invalid credential");
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return done(null, "Invalid credential");
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
