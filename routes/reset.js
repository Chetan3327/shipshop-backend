import express from 'express'
import TokenModel from '../models/Token.js'
import UserModel from '../models/User.js'
import sendEmail from '../utils/EmailSender.js'
import crypto from 'crypto'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'

dotenv.config()


const BASE_URL = process.env.BASE_URL
const EMAIL = process.env.EMAIL

const route = express.Router()

route.get('/send', async (req, res) => {
    try {
        await sendEmail(EMAIL, "subject", "text")
        res.status(200).send("email sent")
    } catch (error) {
        return res.status(400).send(error)
    }
})

route.post('/', async (req, res) => {
    try{
        const {email, newPassword} = req.body

        const user = await UserModel.findOne({email})
        if(!user){
            return res.status(400).send("user with email doesn't exist")
        }

        let token = await TokenModel.findOne({userId: user._id})
        const randomBytes = crypto.randomBytes(32)
        const randomString = randomBytes.toString('hex')
        if(!token){
            token = new TokenModel({userId: user._id, token: randomString})
            await token.save()
        }
        
        const link = `${BASE_URL}/password-reset/${user._id}/${newPassword}/${token.token}`
        // return res.send(link)
        await sendEmail(user.email, "password reset! click below link to reset password", link)
        res.json({message: "password reset link sent to your email address"})
    }catch(error){
        res.json({message: "an error occured"})
        console.log(error)
    }
})

route.get('/:userid/:newPassword/:token', async (req, res) => {
    try {
        // const {password} = req.body
        const password = req.params.newPassword
        const user = await UserModel.findById(req.params.userid)
        
        if(!user) return res.status(400).send(error.details[0].message)

        const token = await TokenModel.findOne({userId: user._id, token: req.params.token})
        if(!token) return res.status(400).send('invalid link or expired')
        
        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword
        await user.save()
        await TokenModel.findByIdAndRemove(token._id);
        res.send("password reset successfully")
    } catch (error) {
        res.send("an error occured")
        console.log(error)
    }
})

export {route as ResetRoute}