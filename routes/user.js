import express from 'express'
const Router = express.Router()

import UserModel from '../models/User.js'

Router.get('/', (req, res) => {
    res.send("hello")
})

Router.get('/users', async (req, res) => {
    try{
        const users = await UserModel.find({})
        res.send(users)
    }catch(err){
        res.send(err)
    }
})

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

Router.post('/register', async (req, res) => {
    const {name, email, password} = req.body
    try {
        const user = await UserModel.findOne({email})
        if(user){
            return res.status(400).json({"error": "user already exists"})
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        
        const newUser = new UserModel({name, email, password: hashedPassword})
        await newUser.save()
        return res.status(201).json({message: "user registered"})

    } catch (error) {
        return res.status(500).json({error: "registration failed!", message: error.message })
    }
})

Router.post('/login', async (req, res) => {
    const {email, password} = req.body
    try{
        const user = await UserModel.findOne({email})
        if(!user){
            return res.status(404).json({message: "no user found"})
        }
        const passwordMatch = await bcrypt.compare(password, user.password)
    
        if(passwordMatch){
            const token = jwt.sign({email}, 'secret', {expiresIn: '1h'})
            return res.status(200).json({token})
        }else{
            return res.status(401).json({message: 'Wrong Password'})
        }
    }catch(error){
        return res.status(500).json({error: 'login failed', message: error.message})
    }
})

import authenticateToken from '../middleware/authenticateToken.js'

Router.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ message: 'Welcome to the dashboard' });
});



export {Router as UserRoute}