let express = require('express');
let router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const validate = require('../../middleware/validate');

// Login route
router.post('/', validate, function (req, res, next) {
  // retrieve email and password from req.body
  const email = req.body.email;
  const password = req.body.password;

  // determine if user already exists in table, return error if pre-existing
  const queryUsers = req.db.from("users").select("*").where("email", "=", email);
  queryUsers
    .then(users => {
      if (users.length === 0) {
          console.log("User does not exist");
          return res.status(401).json({
            error: true,
            message: "Incorrect email or password"
        }); 
      }
      // compare password hashes
      const user = users[0];
      return bcrypt.compare(password, user.hash);
    })
    .then (match => {
      if (!match) {
          // return error if passwords do not match 
          console.log("Passwords do not match");
          return res.status(401).json({
            error: true,
            message: "Incorrect email or password"
          })
      }

      // create and return JWT token if passwords match
      console.log("Passwords match");
      const expires_in = 60 * 60 * 24; // 24 hours
      const exp = Math.floor(Date.now() / 1000) + expires_in;
      const token = jwt.sign({ email, exp }, process.env.JWT_SECRET);
      return res.status(200).json({
          token,
          token_type: "Bearer",
          expires_in
      });
    })
    .catch((error) => {
      console.log(error);
        // return error if unable to log in 
      return res.status(500).json({
       error: true,
       message: "Unable to log in, error with database"
     });
  })
})

module.exports = router;