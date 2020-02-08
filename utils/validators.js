const { body } = require('express-validator')
const User = require('../models/user')
const bcript = require('bcryptjs')

exports.registerValidators = [
    body('email')
        .isEmail().withMessage('Введите корректный email')
        .custom(async (value, {req}) => {
            try {
                const user = await User.findOne({email: value})
                if (user) {
                    return Promise.reject('Пользователь с таким email уже существует')
                }
            } catch (error) {
                console.log(error)
            }
        }).normalizeEmail(),
    body('password', 'Пароль должен быть минимум 6 символов')
        .isLength({min:6, max: 50})
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Пароли должны совпадать')
            }
            return true
        })
        .trim(),
    body('name', 'Имя должно быть минимум 3 символа')
        .isLength({min: 3, max: 50})
        .trim()
]

exports.loginValidators = [
    body('email')
        .isEmail().withMessage('Введите корректный email')
        .custom(async (value, {req}) => {
            try {
                const user = await User.findOne({email: value})
                if (!user) {
                    return Promise.reject('Такого пользователя не существует')
                }
            } catch (error) {
                console.log(error)
            }
        }),
    body('password', 'Пароль должен быть минимум 6 символов')
        .isLength({min:5, max: 50})
        .custom(async (value, {req}) => {
            try {
                const user = await User.findOne({email: req.body.email})
                const areSame = await bcript.compare(value, user.password)
                if (areSame) {
                    req.session.user = user
                    req.session.isAuthenticated = true
                    req.session.save(err => {
                        if (err) throw err
                        else return true
                    })
                } else {
                    return Promise.reject('Неверный пароль')
                }
            } catch (error) {
                console.log(error)
            }
        })
        .isAlphanumeric()
        .trim(),
]