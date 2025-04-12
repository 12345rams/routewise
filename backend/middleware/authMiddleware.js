const { JWT_SECRET } = require("../config/config");
const jwt = require("jsonwebtoken");
const authenticate = async (req, res, next) => {
    let token = req.headers["authorization"];
    console.log("Token:", req.body);
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    token = token.replace("Bearer ", "");
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data;
        res.status(200).json({ message: "Signin successful!" });
        next();
    }
    catch (error) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

module.exports = authenticate;
