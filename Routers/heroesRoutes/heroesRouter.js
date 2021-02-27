const express = require('express'),
	sqlite3 = require('sqlite3');
const heroRouter = express.Router({ mergeParams: true });
const db = new sqlite3.Database('./database.sqlite');

heroRouter.param('heroId', (req, res, next, id) => {
	db.get(`SELECT * FROM Hero WHERE id = ${id}`, (error, hero) => {
		if (error) next(error);
		else if (hero) {
			(req.hero = hero), next();
		} else {
			res.status(404).send('Hero not found!');
		}
	});
});

heroRouter.get('/', (req, res, next) => {
	db.all(
		`SELECT * FROM Hero WHERE world_id = ${req.params.worldId};`,
		(error, heroes) => {
			error ? next(error) : res.send({ heroes });
		}
	);
});

heroRouter.get('/:heroId', (req, res, next) => {
	res.send({ hero: req.hero });
});

heroRouter.post('/', heroStatsVeryfier, (req, res, next) => {
	db.run(
		`INSERT INTO Hero (name, type, power_level, world_id, strengths, weakness, image_url, arena_avatar_url) VALUES ($name, $type, ${req.body.hero.power_level}, ${req.params.worldId}, $strengths, $weakness, $image_url, $arena_avatar_url);`,
		{
			$name: req.body.hero.name,
			$type: req.body.hero.type,
			$strengths: req.body.hero.strengths,
			$weakness: req.body.hero.weakness,
			$image_url: req.body.hero.image_url,
			$arena_avatar_url: req.body.hero.arena_avatar_url,
		},
		function (error) {
			if (error) next(error);
			else
				db.get(
					`SELECT * FROM Hero WHERE id = ${this.lastID};`,
					(error, hero) => {
						error ? next(error) : res.status(201).send({ hero });
					}
				);
		}
	);
});

heroRouter.put('/:heroId', heroStatsVeryfier, (req, res, next) => {
	db.run(
		`UPDATE Hero SET name = $name, type = $type, power_level = ${req.body.hero.power_level}, strengths = $strengths, weakness = $weakness, image_url = $image_url, arena_avatar_url = $arena_avatar_url WHERE id = ${req.hero.id};`,
		{
			$name: req.body.hero.name,
			$type: req.body.hero.type,
			$strengths: req.body.hero.strengths,
			$weakness: req.body.hero.weakness,
			$image_url: req.body.hero.image_url,
			$arena_avatar_url: req.body.hero.arena_avatar_url,
		},
		(error) => {
			if (error) next(error);
			else
				db.get(
					`SELECT * FROM Hero WHERE id = ${req.hero.id};`,
					(error, hero) => {
						error ? next(error) : res.send({ hero });
					}
				);
		}
	);
});

heroRouter.delete('/:heroId', (req, res, next) => {
	db.run(`DELETE FROM Hero WHERE id = ${req.hero.id};`, (error) => {
		error ? next(error) : res.status(204).send('Hero deleted.');
	});
});

function heroStatsVeryfier(req, res, next) {
	if (
		req.body.hero?.name &&
		req.body.hero?.power_level &&
		req.body.hero?.image_url &&
		req.body.hero?.arena_avatar_url
	)
		next();
	else res.status(400).send(`Missing Hero's required information!`);
}
module.exports = heroRouter;
