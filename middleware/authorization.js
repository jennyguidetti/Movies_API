const jwt = require('jsonwebtoken');

// check if valid bearer token is included to authorize route use
module.exports = function(req, res, next) {
    console.log(req.headers);
    if (!('authorization' in req.headers) || !req.headers.authorization.match(/^Bearer /)) {
        // return error if bearer token not included
        res.status(401).json({ error: true, message: "Authorization header ('Bearer token'} not found" });
        return;
    }
    const token = req.headers.authorization.replace(/^Bearer /, "");
    try {
        // verfiy token
        jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            // return error if token expired
            res.status(401).json({ error: true, message: 'JWT token has expired' });
        } else {
            // return error if invalid token
            res.status(401).json({ error: true, message: 'Invalid JWT token' });
        }
        return;
    }
    next()
};