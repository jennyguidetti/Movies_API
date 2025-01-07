let express = require('express');
let router = express.Router();

// format pagination for movie search
function paginatedMovies(currentPage, db, title, year) {
    // set items per page limit
    const perPage = 100;

    // select columns to display from basics database
    const query = db('basics')
    .select('primaryTitle as Title', 'startYear as Year', 'tconst as imdbID', 'titleType as Type')
    .orderBy('imdbID', 'asc') // arrange results by imdbId in ascending order
  
    // add title parameter
    if (title) {
      query.where('primaryTitle', 'like', `%${title}%`);
    }
   // add year parameter
    if (year) {
      query.where('startYear', '=', year);
    }
    return query
    .paginate({ perPage, currentPage, isLengthAware: true })
    .then((result) => {
      const pagination = {
        total: result.pagination.total,
        lastPage: result.pagination.lastPage,
        perPage: result.pagination.perPage,
        currentPage: result.pagination.currentPage,
        from: result.pagination.from,
        to: result.pagination.to
      };
  
      return {
        data: result.data,
        pagination
      };
    });
  }
  
  // search for movies route 
  router.get('/', function (req, res, next) {
    const title = req.query.title;
    const year = req.query.year;
    const page = parseInt(req.query.page, 10) || 1;
    const db = req.db;
  
    // return error if invalid parameters
    const validParams = ['title', 'year', 'page'];
  
    if (!Object.keys(req.query).every(param => validParams.includes(param))) {
      return res.status(400).json({
        error: true,
        message: 'Invalid query parameters. Only year, title and page are permitted.'
      });
    }
  
    // return error if no title supplied
    if (!title) {
      return res.status(400).json({
        error: true,
        message: 'Invalid query parameters. Title is required.'
      });
    }
    // return error if invalid year
    if (year && !/^\d{4}$/.test(year)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid year format. Format must be yyyy'
      });
    }
  
    paginatedMovies(page, db, title, year)
      .then(({ data, pagination }) => {
        const noResults = (data.length === 0);
        // return error if page number is too high
        if (page > 1 && page > pagination.lastPage) {
          return res.status(404).json({
            error: true,
            message: 'Requested page does not exist.'
          });
        }
        // return error if no results found for year
        if (noResults) {
          if (year) {
            return res.status(404).json({
              error: true,
              message: 'No results found for the specified title and year.'
            });
          }
          // return error if no results for title
          return res.status(404).json({
            error: true,
            message: 'No results found for the specified title.'
          });
        }
        // return results 
        res.json({ data, pagination });
        })
        // return error if unable to retrieve movies list
        .catch((error) => {
          console.log(error);
          return res.status(500).json({
            error: true,
            message: 'Error in MySQL query. Unable to retrieve movie list'
          });
        }); 
  });
  
module.exports = router;