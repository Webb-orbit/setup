import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cookieParser())
app.use(cors({
    origin:process.env.CORS_ORGINE,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({limit:"16kb", extended:true}))
app.use(express.static("public"))

import router from "./routes/user.routes.js"
import videorouter from "./routes/video.routes.js"

app.use("/api/v1/users", router)
app.use("/api/v1/video", videorouter)
export { app }