let express = require('express');
let router = express.Router();
const authorization = require('../../middleware/authorization');

// get poster route
router.get('/:imdbId', authorization, function (req, res, next) {
  // return error if additional parameters
  if (Object.keys(req.query).length > 0) {
    return res.status(400).json({
      error: true,
      message: 'Invalid query parameters. Query parameters are not permitted.'
    });
  }

  // select all rows from posters table in database
  req.db
    .from('posters')
    .select('*')
    .where('imdbId', '=', req.params.imdbId) // identify poster by imdbId
    .then((rows) => {
      if (rows.length === 0) {
        // return error if no results
        return res.status(400).json({
          error: true,
          message: 'No poster result for the imdbID, ensure valid ID'
        })
      }
      // show poster image
      const posterData = rows[0].poster;
      res.set('Content-Type', 'image/png');
      res.status(200).send(posterData);
    })
    .catch((err) => {
      console.log(err);
      // return error if unable to retrieve poster from database
      res.status(500).json({
        error: true,
        message: "ENOENT: no such file or directory, open 'res/posters/notExist_mike@gmail.com.png'"
      })
    })
})

module.exports = router;