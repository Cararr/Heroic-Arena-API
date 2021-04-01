const express = require('express'),
	bcrypt = require('bcryptjs'),
	sqlite3 = require('sqlite3');
const registerRouter = express.Router();
const db = new sqlite3.Database('./database.sqlite');

registerRouter.post('/', userInfoVerifier, async (req, res, next) => {
	try {
		const hashedpassword = await bcrypt.hash(req.body.user.password, 10);
		db.run(
			'INSERT INTO User (name, password) VALUES ($name, $password);',
			{
				$name: req.body.user.name,
				$password: hashedpassword,
			},
			(error) => (error ? res.status(400).send(error) : res.status(204).send())
		);
	} catch (error) {
		console.log(error);
	}
});

function userInfoVerifier(req, res, next) {
	req.body.user?.name && req.body.user?.password
		? next()
		: res.status(400).send({ error: "Missing User's name or password!" });
}

module.exports = registerRouter;
