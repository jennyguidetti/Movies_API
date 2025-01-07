module.exports = (req, res, next) => {
    // retrieve email and password from req.body
    const email  = req.body.email;
    const password = req.body.password;
    
    // verify body, return error if invalid
    if (!email || !password) {
        return res.status(400).json({
          error: true,
          message: "Request body incomplete, both email and password are required"
        });
      }
      next();
}