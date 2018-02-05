/*const router = require('express').Router();
module.exports = router;

const Score = require('../db');

router.get('/score', (req, res, next) => {
    Score.findAll({})
      .then(scores => res.json(scores))
      .catch(next)
  });
  
// Prevent api post request from user
// router.post('/scorepost-detector', (req, res, next) => {

// });

router.post('/score-post', (req, res, next) => {
    Score.create(req.body)
    .then(newScore => res.json(newScore))
    .catch(next)
});*/