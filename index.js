import express from 'express'
const app = express()
import dotenv from 'dotenv'
dotenv.config()

import cors from 'cors'
app.use(cors())
app.use(express.json())

import mongoose from 'mongoose'
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
})

import {UserRoute} from './routes/user.js'
app.use('/auth', UserRoute)

import {ResetRoute} from './routes/reset.js'
app.use('/password-reset', ResetRoute)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`)
})