const bcrypt = require('bcryptjs'),
	sqlite3 = require('sqlite3'),
	LocalStrategy = require('passport-local').Strategy;
const db = new sqlite3.Database('./database.sqlite');

module.exports = function (passport) {
	passport.use(
		new LocalStrategy({ usernameField: 'name' }, (name, password, done) => {
			db.get(
				`SELECT * FROM User WHERE name = $name;`,
				{ $name: name },
				async (error, user) => {
					if (error) {
						console.log(error);
						return;
					}
					if (!user) return done(null, false, { message: 'Not recognized!' });
					try {
						if (await bcrypt.compare(password, user.password)) {
							return done(null, user);
						} else {
							return done(null, false, { message: 'Incorrect password.' });
						}
					} catch (error) {
						done(error);
					}
				}
			);
		})
	);
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		db.get(`SELECT * FROM User WHERE id = ${id};`, (error, user) => {
			done(error, user);
		});
	});
};
