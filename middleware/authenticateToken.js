const authenticateToken = (req, res, next) => {
    const token = req.headers.Authorization
    if(!token){
        return res.status(401).json({message: "access denied"})
    }
    jwt.verify(token, 'secret', (err, user) => {
        if(err){
            return res.status(403).json({message: "invalid token"})
        }
        req.user = user
        next()
    })
}
export default authenticateToken