import GoogleStrategy from "passport-google-oauth20"

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.BE_URL}/users/googleRedirect`, // this needs to match EXACTLY with the redirect URL you have configured on Google
  },
  (_, __, profile, passportNext) => {
    // This function is executed when Google sends us a successfull response
    // Here we are going to receive some informations about the user from Google (scopes --> profile, email)
    console.log("PROFILE:", profile)
  }
)

export default googleStrategy
