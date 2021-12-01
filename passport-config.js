//this site contains the passport library which authenticates user data

const LocalStrategy = require('passport-local').Strategy

//bcrypt is going to be required to authenticate the password field since it is stored hashed
const bcrypt = require('bcrypt')


function initialize(passport, getUserByEmail, getUserById) {

    //authenticate user function , pass user data and a var to signal the
    const authenticateUser = async (email, password, done) => {
        // will return a user by email or null if there is no such email
        const user = getUserByEmail(email)
        ///chek if we found a user , if we didn't return an alert
        if (user == null){
            return done(null, false, { message : 'no user with that email'})
        }

        try{
            //bcrypt compare function is async
            if (await bcrypt.compare(password, user.password)){
                //succesfull authentication, so return the authenticated user
                return done(null, user)

            }else {
                //in this case the password did not match 
                return done(null, false, { message : 'wrong password'})
            }
        }catch (e){
            //in case there is an unforseen error , return it
            return done(e)
        }
    }

    //pass the email as username. Password is passed automatically due to following name convention. Pass also the auth function
    passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateUser))

    passport.serializeUser((user, done) =>  done(null, user.id))
    passport.deserializeUser((id, done) =>  {
        return done(null, getUserById(id))
    })
}



//ensure we can call this function outside this script
module.exports = initialize