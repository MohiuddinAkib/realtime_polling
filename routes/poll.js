const express = require('express'),
  Pusher = require('pusher'),
  Vote = require('../models/Vote'),
  debug = require('debug')('app:Poll'),
  router = express.Router();

// Init pusher
const pusher = new Pusher({
  appId: '681438',
  key: '1782e74cb8faaba3558c',
  secret: 'd478221b7966f7a38133',
  cluster: 'ap2',
  encrypted: true
});

/**
 * @route         /poll
 * @type          GET
 * @access        Public
 * @description   Home page of poll
 * @return        Ressponse
 */
router.get('/', (req, res) => {
  Vote.find({})
    .exec()
    .then(votes => res.json({ success: true, votes }))
    .catch(err => {
      debug('Poll get error', err);
    });
});

/**
 * @route         /poll
 * @type          POST
 * @access        Public
 * @description   Vote page
 * @return        Ressponse
 */
router.post('/', (req, res) => {
  const newVote = {
    os: req.body.os,
    points: 1
  };
  new Vote(newVote)
    .save()
    .then(vote => {
      pusher.trigger('os-poll', 'os-vote', {
        points: +vote.points,
        os: vote.os
      });

      return res
        .status(201)
        .json({ success: true, message: 'Thank you for voting' });
    })
    .catch(err => {
      debug('Poll post', err);
      res.status(500).json({ message: 'Vote was not successful' });
    });
});

module.exports = router;
