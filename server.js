'use strict';

const express = require('express');
const bodyParser = require('body-parser')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)


const routes = require('./routes/')
const  connect  = require('./database').connect

const app = express();

//set a globabl port variable
const port = process.env.PORT || 3000
app.set('port', port)

app.set('view engine', 'pug');
app.locals.user = {email: 'nothing@nothing.com'}

//Middleware

app.use(session({
  store: new RedisStore(),
  secret: 'pizzadescottsupersecretkey'
}))

app.use((req, res, next) => {
  app.locals.email = req.session.email
  next()
})

app.use(bodyParser.urlencoded({ extended: false }));

// routes
app.use(routes)

//Enable server
connect()
	.then(() => {
		// Only opens the port after connecting to Mongo
		app.listen(port, () =>
			console.log(`Express server listening on port ${port}`)
		)
	})
	.catch(console.error)
