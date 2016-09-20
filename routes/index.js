'use strict';

const { Router } = require('express')
const router = Router()
const bcrypt = require('bcrypt')

const User = require('../models/user')

// Route
router.get('/', (req,res) =>
	res.render('home')
)
router.get('/login', (req,res) =>
	res.render('login', {page: 'login'})
)
router.post('/login', (req, res, err) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        return new Promise((resolve, reject) => {
          bcrypt.compare(req.body.password, user.password, (err, matches) => {
            if (err) {
              reject(err)
            } else {
              resolve(matches)
            }
          })
        })
      } else {
        res.render('login', { msg: 'Email does not exist in our system' })
      }
    })
    .then((matches) => {
      if (matches) {
        req.session.email = req.body.email
        res.redirect('/')
      } else {
        res.render('login', { msg: 'Password does not match' })
      }
    })
    .catch(err)
})

router.get('/register', (req, res) =>
  res.render('register')
)

router.get('/logout', (req, res) => res.render('logout'))

router.post('/logout', (req, res, err) => {
	req.session.destroy((err) => {
		if (err) throw err
			res.redirect('/login')
	})
})

router.post('/register', (req, res, err) => {
    User.findOne({ email: req.body.email })
      .then(user => {
        if (user) {
          res.render('register', { msg: 'Email is already registered' })
        } else {
        	// Create a new promise bcrypt does not support native promises
          return new Promise((resolve, reject) => {
            bcrypt.hash(req.body.password, 15, (err, hash) => {
              if (err) {
                reject(err)
              } else {
              	// Async fires and returns the hashed password
                resolve(hash)
              }
            })
          })
        }
      })
      .then(hash => User.create({ email: req.body.email, password: hash }))
      .then(() => res.redirect('/login'), { msg: 'User created' })
      .catch(err)
})
module.exports = router;
