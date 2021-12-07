// This script contains the basic server functionality, site links and basic methods

//load the environment variables if we are in DEV mode
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

//import express framework and get the app variable from express
const express = require('express')
const app = express()

//add the flash and session express libraries, flash helps with storing messages and clearing them after display to the user
const flash = require('express-flash')
//add the express session framework to manage session middleware
const session = require('express-session')

//library for hashing values and comparing them
const bcrypt = require('bcrypt')

//authentication library
const passport = require('passport')

//since delete is not supported by HTML forms, this library helps to override the function and 
const methodOverride = require('method-override')

// call the passport config function 
const initializePassport = require('./passport-config')
//pass the init params for passport configuration and find out if the entered email is in the DB
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

//use a local variable to store data. Only for training
const users = []

//set the view engine to EJS
app.set('view-engine', 'ejs')

// ensure the app can access the forms inside the req var inside the post method
app.use(express.urlencoded({ extended: false }))


app.use(flash())
app.use(session({
    //set the session options , use secret key for encrypt, don't resave if there are no changes
   secret: process.env.SESSION_SECRET, 
   resave: false,
   //don't save empty values in this session
   saveUninitialized: false
}))
//setup passport and ensure the data stays for the entire session
app.use(passport.initialize())
app.use(passport.session())

//method overide , to override POST method
app.use(methodOverride('_method'))

// set up the homepage  page route with a request and a response variable
app.get('/', checkAuthenticated, (req, res) => {
    //render a file as a response and pass a user 
    res.render('index.ejs', { name: req.user.name })
})

//set up the login page route
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

//use the passport authenticator
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    //on success takes us to homepage and on fail takes us back to login page.
    successRedirect: '/',
    failureRedirect: '/login',
    //displays the errors
    failureFlash: true
}))

//set up the register page route
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

// new user register functionality
app.post('/register', checkNotAuthenticated, async (req, res) => {
    // try to process user i inpuy
    try {
        //encrypt user password
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        //generate a unique ID and push the rest of the user data in our table     PUSH HERE
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        //redirect to login after the data is entered successfully
        res.redirect('/login')
    } catch {
        //redirect to register in case of error
        res.redirect('/register')
    }
})

//logout function, since delete is not supported by HTML forms
app.delete('/logout', (req, res) => {
    //use logout function from passport
    req.logOut()
    res.redirect('/login')
})

//checks if the user is authenticated and 
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        //if the user is authenticated call next
        return next()
    }
    //if he is not direct him to login page
    res.redirect('/login')
}


//checks if the user is not authenticated and 
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
}

// run app on port 3000
app.listen(3000)
