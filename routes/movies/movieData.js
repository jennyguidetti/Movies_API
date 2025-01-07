let express = require('express');
let router = express.Router();

// get movie data from database
function getMoviesDb(knex, tconst) {
  return knex
  // select columns to display from basics table in database
    .from('basics')
    .leftJoin('crew', 'basics.tconst', 'crew.tconst') // join basics table to crew table
    .select(
      'basics.primaryTitle as Title', 
      'basics.startYear as Year', 
      'basics.runtimeMinutes as Runtime', 
      'basics.genres as Genre',
      'crew.directors as DirectorNconst',
      'crew.writers as WriterNconst'
    )
    .where('basics.tconst', '=', tconst) // add imdbID parameter
    .first()
    .then(movieData => {
      // return error if no results
      if (!movieData) {
        return Promise.reject(new Error('No movie results for the imdbID'));
      }
      // return names of directors and writers
      return Promise.all([
        getNames(knex, movieData.DirectorNconst),
        getNames(knex, movieData.WriterNconst)
      ]).then(([directorNames, writerNames]) => {
        movieData.Director = directorNames;
        movieData.Writer = writerNames;
        movieData.Runtime = movieData.Runtime ? `${movieData.Runtime} min` : 'N/A';
        return movieData;
      })
    })
}

// get director and writers names from names table in database
function getNames(knex, nconsts) {
  if (!nconsts) return Promise.resolve('N/A');
  const ids = nconsts.split(',');
  return knex('names').select('primaryName').whereIn('nconst', ids)
   .then(names => names.map(name => name.primaryName).join(','));
}

// get movie data from OMDB API
function getMoviesOmdb(tconst) {
  const OMDBAPI_BASE_DATA = 'http://www.omdbapi.com';
  const OMDBAPI_KEY = process.env.OMDBAPI_KEY;
  const movieDataUrl = `${OMDBAPI_BASE_DATA}/?apikey=${OMDBAPI_KEY}&i=${tconst}`;

  return fetch(movieDataUrl)
    .then(movieDataResponse => movieDataResponse.json())
    .then(omdbData => {
      if (omdbData.Response === 'False') {
        return Promise.reject(new Error('No movie results for the imdbID'));
      }

      const imdbRating = omdbData.Ratings.find(rating => rating.Source === 'Internet Movie Database');

      return {
        actors: omdbData.Actors || 'N/A',
        imdbRating: imdbRating ? imdbRating.Value : 'N/A'
      }
    })
    .catch(error => {
      return Promise.reject(new Error('Error fetching data from OMDB API'));
    })
}

// movie data route
router.get('/:imdbId', async function (req, res, next) {
    const knex = req.db;
    const tconst = req.params.imdbId;
  
    // return error if additional parameters
    if (Object.keys(req.query).length > 0) {
      return res.status(400).json({
        error: true,
        message: 'Invalid query parameters. Query parameters are not permitted.'
      });
    }

    // fetch data from database and API
    getMoviesDb(knex, tconst)
      .then(movieData => {
        return getMoviesOmdb(tconst)
          .then(omdbData => {
            // return formatted results
            res.status(200).json({
              Title: movieData.Title,
              Year: movieData.Year,
              Runtime: movieData.Runtime,
              Genre: movieData.Genre,
              Director: movieData.Director,
              Writer: movieData.Writer,
              Actors: omdbData.actors,
              Ratings: [
                {
                  "Source": "Internet Movie Database",
                  "Value": `${omdbData.imdbRating}`
                }
              ]
            })
          })
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({
          error: true,
          message: 'Error retrieving movie data'
        })
      })
  })

module.exports = router;