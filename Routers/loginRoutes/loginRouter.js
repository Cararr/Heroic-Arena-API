const express = require('express'),
	sqlite3 = require('sqlite3'),
	bcrypt = require('bcryptjs');
// const	passport = require('passport');
const loginRouter = express.Router();
const db = new sqlite3.Database('./database.sqlite');

loginRouter.post('/', (req, res, next) => {
	db.get(
		`SELECT * FROM User WHERE name = $name;`,
		{ $name: req.body.name },
		async (error, user) => {
			if (error) next(error);
			if (!user) res.status(401).send({ response: 'User not found!' });
			else {
				const match = await bcrypt.compare(req.body.password, user.password);
				if (match) res.send({ user: user.name });
				else res.status(401).send({ response: 'Wrong password!' });
			}
		}
	);
});

/* loginRouter.post('/', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/',
		failureFlash: true,
	})(req, res, next);
}); */

module.exports = loginRouter;
