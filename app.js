const express = require('express')
const app = express()
const morgan = require('morgan')
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')
const expressValidator = require("express-validator")
const fs = require('fs')
const cors = require('cors')



dotenv.config()
app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

mongoose.connect(process.env.MONGO_URI).then(()=>{console.log("db connected")})
mongoose.connection.on("error", err=>{
    console.log(`db connection error: ${err.message}`)
})
const postRoutes= require('./routes/post')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const newsRoutes=require('./routes/news')
app.get('/', (req, res)=> {
    fs.readFile('docs/apiDocs.json', (err, data)=> {
        if(err){
            res.status(400).json({
                error: err
            })
        }
        const docs = JSON.parse(data)
        res.json(docs)
    })
})

app.use(morgan('dev'))
app.use(cookieParser())
app.use(expressValidator())
app.use("/", postRoutes)
app.use("/", authRoutes)
app.use("/", userRoutes)
app.use("/", newsRoutes)
app.use(function (err, req, res, next){
    if(err.name==='UnauthorizedError'){
        res.status(401).json({error: "Unauthorized "})
    }
    next()
})
const port = process.env.PORT || 8080
app.listen(port, ()=>{
    console.log(`a nodejs api is listening on port: ${port}`)
})