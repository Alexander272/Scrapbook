const {Router} = require('express')
const router = Router()
const bcript = require('bcryptjs')
const { validationResult } = require('express-validator')
const { registerValidators, loginValidators } = require('../utils/validators')
const User = require('../models/user')

router.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        registerError: req.flash('registerError'),
        loginError: req.flash('loginError'),
        registerData: req.flash('registerData'),
        loginData: req.flash('loginData')
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })
})

router.post('/login', loginValidators, (req, res) => {
    const data = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        req.flash('loginData', data)
        req.flash('loginError', errors.array()[0].msg)
        return res.status(422).redirect('/auth/login#login')
    }
    else (
        res.redirect('/')
    )
})

router.post('/register', registerValidators, async (req, res) => {
    try {
        const { name, email, password } = req.body

        const data = req.body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('registerData', data)
            req.flash('registerError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        }

        const hashPassword = await bcript.hash(password, 10)
        const user = new User({ email, name, password: hashPassword })
        await user.save()
        
        res.redirect('/auth/login#login')
    } catch (error) {
        console.log(error)
    }
})

module.exports = router