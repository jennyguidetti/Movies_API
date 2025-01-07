let express = require('express');
let router = express.Router();
let multer = require('multer');

const authorization = require('../../middleware/authorization');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// add poster route
router.post(`/:imdbId`, authorization, upload.single('poster'), async (req, res) => {
  const { imdbId } = req.params;
  const poster = req.file;

  try {
    // return error if no imdbID or poster supplied
    if (!imdbId || !poster) {
      return res.status(400).json({ 
        error: true,
        message: 'You must supply an imdbID and poster image/png file' 
      })
    } 
    // return error if additional parameters
    if (Object.keys(req.query).length > 0) {
      return res.status(400).json({
        error: true,
        message: 'Invalid query parameters. Query parameters are not permitted.'
      });
    }
    const posterData = poster.buffer;

    // check if poster with same imdbId already exists
    const existingPoster = await req.db('posters').select('*').where('imdbId', imdbId);
    if (existingPoster.length > 0) {
      return res.status(400).json({ 
        error: true,
        message: 'Poster already exists for the specified imdbID' // return error if poster exists
      })
    }

    // add imdbId and file to posters table in database
    await req.db('posters').insert({ imdbId: imdbId, poster: posterData });

    // show success message
    console.log('Successful poster upload:', imdbId);
    return res.status(201).json({ 
      error: false,
      message: `Successful update for imdbId ${imdbId}` 
    });
  } catch (error) {
    console.log (error);
    return res.status(500).json({
      error: true,
      message: "ENOENT: no such file or directory, open 'res/posters/notExist_mike@gmail.com.png'" 
    })
  }
});
  
module.exports = router;