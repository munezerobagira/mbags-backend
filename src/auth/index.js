import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { User } from "../models";
import { tokenSecret } from "../config";
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
        if (!user)
          return done(null, false, { message: "Invalid credentials." });
        const isMatch = await user.comparePassword(password);
        if (!isMatch)
          return done(null, false, { message: "Invalid credentials" });
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
