const { JWT_SECRET } = require("../config/config");
const jwt = require("jsonwebtoken");
const authenticate = async (req, res, next) => {
    let token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    token = token.replace("Bearer ", "");
    console.log(token);
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data;
        console.log(data);
        next();
    }
    catch (error) {
        res.status(400).json({ message: "Invalid Toekn" });
    }
};

module.exports = authenticate;
