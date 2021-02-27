const express = require('express'),
	morgan = require('morgan'),
	cors = require('cors'),
	errorHandler = require('errorhandler'),
	worldsRouter = require('./Routers/worldsRoutes/worldsRouter');
const server = express();
const PORT = process.env.PORT || 4000;

server.use(express.json());
server.use(morgan('dev'));
server.use(cors());

server.use('/worlds', worldsRouter);

server.use(errorHandler());
server.listen(PORT, () => console.log(`CArArr on ${PORT}`));
