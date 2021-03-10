const express = require('express'),
	heroRouter = require('../heroesRoutes/heroesRouter'),
	sqlite3 = require('sqlite3');
const worldsRouter = express.Router();
const db = new sqlite3.Database('./database.sqlite');

worldsRouter.param('worldId', (req, res, next, id) => {
	db.get(`SELECT * FROM World WHERE id = ${id}`, (error, world) => {
		if (error) next(error);
		else if (world) {
			req.world = world;
			next();
		} else {
			res.status(404).send('World not found!');
		}
	});
});

worldsRouter.get('/', (req, res, next) => {
	db.all('SELECT * FROM World;', (error, worlds) => {
		error ? next(error) : res.send({ worlds });
	});
});

worldsRouter.get('/:worldId', (req, res, next) => {
	res.send({ world: req.world });
});

worldsRouter.post('/', worldStatsVeryfier, (req, res, next) => {
	db.run(
		'INSERT INTO World (name, world_origin, logo_url) VALUES ($name, $world_origin, $logo_url);',
		{
			$name: req.body.world.name,
			$world_origin: req.body.world.world_origin,
			$logo_url: req.body.world.logo_url,
		},
		function (error) {
			if (error) next(error);
			else {
				db.get(
					`SELECT * FROM World WHERE id = ${this.lastID};`,
					(error, world) => {
						error ? next(error) : res.status(201).send({ world });
					}
				);
			}
		}
	);
});

worldsRouter.put('/:worldId', worldStatsVeryfier, (req, res, next) => {
	db.run(
		`UPDATE World SET name = $name, world_origin = $world_origin, logo_url = $logo_url WHERE id = ${req.world.id};`,
		{
			$name: req.body.world.name,
			$world_origin: req.body.world.world_origin,
			$logo_url: req.body.world.logo_url,
		},
		(error) => {
			if (error) next(error);
			else {
				db.get(
					`SELECT * FROM World WHERE id = ${req.world.id};`,
					(error, world) => {
						error ? next(error) : res.send({ world });
					}
				);
			}
		}
	);
});

worldsRouter.delete('/:worldId', (req, res, next) => {
	db.all(
		`SELECT * FROM Hero WHERE world_id = ${req.params.worldId};`,
		(error, heroes) => {
			if (error) next(error);
			else if (heroes.length)
				res.status(400).send(
					`Can not delete the world if it has heroes related to it! ${
						req.world.name
					} has fallowing heroes supplied: ${heroes
						.map((hero) => {
							return hero.name;
						})
						.join(', ')}`
				);
			else
				db.run(
					`DELETE FROM World WHERE id = ${req.params.worldId};`,
					(error) => {
						error ? next(error) : res.status(204).send();
					}
				);
		}
	);
});

worldsRouter.use('/:worldId/heroes', heroRouter);

function worldStatsVeryfier(req, res, next) {
	console.log(req);
	req.body.world?.name
		? next()
		: res.status(400).send({ error: "Missing World's name!" });
}

module.exports = worldsRouter;
