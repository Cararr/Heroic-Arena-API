const express = require('express'),
	morgan = require('morgan'),
	cors = require('cors'),
	errorHandler = require('errorhandler'),
	worldsRouter = require('./Routers/worldsRoutes/worldsRouter'),
	loginRouter = require('./Routers/loginRoutes/loginRouter');
const server = express(),
	sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

const PORT = process.env.PORT || 4000;

server.use(express.json());
server.use(morgan('dev'));
server.use(cors());

server.use('/login', loginRouter);

server.use('/worlds', worldsRouter);

server.get('/heroes', (req, res, next) => {
	db.all(`SELECT * FROM Hero;`, (error, heroes) => {
		error ? next(error) : res.send({ heroes });
	});
});

server.use(errorHandler());
server.listen(PORT, () => console.log(`CArArr on ${PORT}`));
