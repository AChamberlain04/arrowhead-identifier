require('dotenv').config()

const express = require('express')
const app = express()
const mongoose = require("mongoose")
const passport = require('passport')
const session = require('express-session')
const { MongoStore } = require('connect-mongo')
const flash = require('express-flash')
const logger = require('morgan')
const connectDB = require('./config/database')

//Load passport config//
require('./config/passport')(passport)


const PORT = 3001

const mainRoutes = require("./routes/main")
const artifactRoutes =
  require("./routes/artifacts");



//Cloudinary//
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})



// Mongoose Connection//
mongoose.connect(process.env.DB_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(err => {
    console.log(err);
  });
    // MiddleWare//
app.set('view engine', 'ejs') 
// the above line tells Express to use EJS as the template system. so the GET request would be app.get("/", (req, res) => { res.render("index");}); since index.ejs is in views.
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


//sessions//
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DB_STRING
  })
}))

//passport and middleware
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.messages = req.flash()
  next()
})

// Routes//
app.use('/', mainRoutes)
app.use("/artifacts", artifactRoutes);


// Server Start//
app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})



