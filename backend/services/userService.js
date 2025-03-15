const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/userModel');
const register = async (userData) => {
    const { email, password } = userData;
    const exitUser = await User.findOne({ email });
    if (exitUser) {
        throw new Error('User already exit');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
        email, password: hashPassword
    })
    await user.save();
    return "User is Register SuccessFully";
};
const login = async (credential) => {
    const { email, password } = credential;
    const user = await User.findOne({ email });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
        throw new Error("Invalid credentials");
    const token = jwt.sign(
        { id: user.id, email: user.email },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN, algorithm: "HS256" }
    );
    return token;
}
const updateLocation = async (data) => {
    const token = data.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    //console.log(decoded);
    await User.findByIdAndUpdate(userId, {
        currLocation: {
            latitude: data.latitude,
            longitude: data.longitude
        }
    });
    return { success: true, message: "Location updated successfully" };
};
const getAllUser = async () => {
    const response = await User.find();
    return response;
}

module.exports = {
    login, register, updateLocation, getAllUser
}
