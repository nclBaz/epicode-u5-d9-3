import express from "express"
import createHttpError from "http-errors"
import passport from "passport"
import { adminOnlyMiddleware } from "../../lib/auth/adminOnly.js"
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js"
import { createAccessToken } from "../../lib/auth/tools.js"
import UsersModel from "./model.js"

const usersRouter = express.Router()

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body)
    const { _id } = await newUser.save()
    // send a confirmation email to the email address
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const users = await UsersModel.find({})
    res.send(users)
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/googleLogin", passport.authenticate("google", { scope: ["profile", "email"] }))
// The purpose of this endpoint is to redirect users to Google Consent Screen

usersRouter.get(
  "/googleRedirect",
  passport.authenticate("google", { session: false }),
  async (req, res, next) => {
    console.log(req.user)
    res.send({ accessToken: req.user.accessToken })
  }
)
// The purpose of this endpoint is to bring users back, receiving a response from Google, then execute the callback function, then send a response to the client

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id)
    res.send(user)
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    })
    res.send(updatedUser)
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    await UsersModel.findByIdAndUpdate(req.user._id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)
    res.send(user)
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/:userId", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:userId", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/login", async (req, res, next) => {
  try {
    // 1. Obtain the credentials from req.body
    const { email, password } = req.body

    // 2. Verify the credentials
    const user = await UsersModel.checkCredentials(email, password)

    if (user) {
      // 3.1 If credentials are fine --> generate an access token (JWT) and send it back as a response
      const payload = { _id: user._id, role: user.role }

      const accessToken = await createAccessToken(payload)
      res.send({ accessToken })
    } else {
      // 3.2 If credentials are NOT fine --> trigger a 401 error
      next(createHttpError(401, "Credentials are not ok!"))
    }
  } catch (error) {
    next(error)
  }
})

export default usersRouter
