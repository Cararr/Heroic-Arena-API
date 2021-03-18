const express = require('express'),
	sqlite3 = require('sqlite3');
const loginRouter = express.Router();
const db = new sqlite3.Database('./database.sqlite');

loginRouter.get('/', (req, res, next) => {
	db.get(
		`SELECT * FROM User WHERE name = $name;`,
		{ $name: req.query.name },
		(error, user) => {
			if (error) next(error);
			else if (user?.is_admin) res.json({ allowed: true });
			else res.status(403).send({ allowed: false });
		}
	);
});

module.exports = loginRouter;
