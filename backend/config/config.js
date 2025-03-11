require('dotenv').config();
module.exports={
    port:process.env.PORT,
    URL_DB:process.env.URL_DB,
    JWT_SECRET:process.env.JWT_SECRET,
    JWT_EXPIRES_IN:process.env.JWT_EXPIRES_IN,
}