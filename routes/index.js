let express = require('express');
let router = express.Router();

// import movie routes
const movieSearchRouter = require('./movies/movieSearch');
const movieDataRouter = require('./movies/movieData');

// import poster routes
const posterGetRouter = require('./posters/posterGet');
const posterAddRouter = require('./posters/posterAdd');

// import user routes
const userRegisterRouter = require('./user/userRegister');
const userLoginRouter = require('./user/userLogin');

// attach routes to main router
router.use('/movies/search', movieSearchRouter);
router.use('/movies/data', movieDataRouter);
router.use('/posters', posterGetRouter);
router.use('/posters/add', posterAddRouter);
router.use('/user/register', userRegisterRouter);
router.use('/user/login', userLoginRouter);

module.exports = router;
