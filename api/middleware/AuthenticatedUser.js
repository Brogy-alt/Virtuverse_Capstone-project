// importing authentiction middleware
require('dotenv').config();
const {sign, verify} = require('jsonwebtoken');
// creation of token
function createToken(user) {
    return sign({
        emailAdd
        :user.emailAdd,
        userPass:user.userPass
    },
    process.env.SECRET_KEY,
    {
        expiresIn: '1h'
    });
  }

  function verifyAToken(req, res, next) {
    try{
        const token = req.cookies["LegitUser"]
        !== null ? req.cookies ["LegitUser"] :
        "Please register";
        const isValid = null;
        if(token !== "Please register") {
            isValid = varify(token, process.env.SECRET_KEY);
            if(isValid) {
                req.authenticated = true;
                next();
            }else {
                res.status(400).json({err:"Please register to gain access"})
            }
        }else {
            res.status(400).json({err:e.message});
            }
        }catch(e) {
        res.status(400).json({err: e.message});
    }   
 }
 module.exports = {createToken, verifyAToken};