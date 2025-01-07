let express = require('express');
let router = express.Router();
const bcrypt = require("bcrypt");
const validate = require('../../middleware/validate');

// Registration route
router.post('/', validate, function (req, res, next) {
    // retrieve email and password from req.body
    const email  = req.body.email;
    const password = req.body.password;
  
    // determine if user already exists in table, return error if pre-existing
    const queryUsers = req.db.from("users").select("*").where("email", "=", email);
    queryUsers
    .then(users => {
      if (users.length > 0) {
        console.log('User already exists');
        return res.status(409).json({
          error: true,
          message: "User already exists"
        });
      }
  
      // insert user into DB
      const saltRounds = 10;
      const hash = bcrypt.hashSync(password, saltRounds);
      return req.db.from("users").insert({ email, hash });
    })
    .then(() => {
      if (!res.headersSent) {
        // return message if successful
        return res.status(201).json({
        error: true,
        message: "User created"
        });
      }
    })
    .catch((error) => {
      console.log(error);
      if (!res.headersSent) {
        // return error message if failure to create user
        return res.status(500).json({
          error: true,
          message: "Unable to create user, error with database"
        });
      } 
    });
  });

module.exports = router;