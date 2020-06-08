const jwt = require('jsonwebtoken');
const passport = require('passport')
const Strategy = require('passport-local').Strategy
// const expressSession = require('express-session')
const Users = require('./models/users');
const bcrypt = require('bcrypt');

const jwtSecret = process.env.JWT_SECRET || 'mark it zero'
const sessionSecret = process.env.SESSION_SECRET || 'lmao'
const adminPassword = process.env.ADMIN_PASSWORD || 'iamthewalrus'
const jwtOpts = {
    algorithm: 'HS256',
    expiresIn: '30d'
}

passport.use(adminStrategy());
// passport.serializeUser((user, cb) => cb(null, user))
// passport.deserializeUser((user, cb) => cb(null, user))

// function session() {
//     return expressSession({
//         secret: sessionSecret,
//         resave: false,
//         saveUninitialized: false
//     })
// }

// function setMiddleware(app) {

// app.use(session());
// app.use(passport.initialize());
// app.use(passport.session());
// }

const login = async (req, res) => {
    const token = await sign({
        username: req.user.username
    });
    res.cookie('jwt', token, {
        httpOnly: true
    });
    res.json({
        success: true,
        token: token
    })
}

const authenticate = passport.authenticate('local', {
    session: false
});

async function ensureUser(req, res, next) {
    const jwtString = req.headers.authorization || req.cookies.jwt;
    const payload = await verify(jwtString);
    if (payload.username) {
        req.user = payload
        if (req.user.username === 'admin') req.isAdmin = true
        return next()
    }

    const err = new Error('Unauthorized')
    err.statusCode = 401
    next(err)
}

function adminStrategy() {
    return new Strategy(async function (username, password, cb) {
        const isAdmin = username === 'admin' && password === adminPassword
        if (isAdmin) return cb(null, {
            username: 'admin'
        })
        try {
            const user = await Users.get(username)
            if (!user) return cb(null, false)
            const isUser = await bcrypt.compare(password, user.password)
            if (isUser) return cb(null, {
                username: user.username
            })
        } catch (err) {}
        cb(null, false)
    })
}

async function sign(payload) {
    const token = await jwt.sign(payload, jwtSecret, jwtOpts)
    return token
}

async function verify(jwtString = '') {
    jwtString = jwtString.replace(/^Bearer /i, '')
    try {
        const payload = await jwt.verify(jwtString, jwtSecret)
        return payload
    } catch (err) {
        err.statusCode = 401
        throw err
    }
}

module.exports = {
    // setMiddleware,
    authenticate,
    login,
    ensureUser
}