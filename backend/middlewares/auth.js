const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('./asyncErrorHandler');

exports.isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    console.log(token);
    if (!token) {
        return next(new ErrorHandler("Please Login to Access", 401))
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedData);
    req.user = await User.findById(decodedData.id);
    // next();
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {

        // if (!roles.includes(req.user.role)) {
        //     return next(new ErrorHandler(`Role: ${req.user.role} is not allowed`, 403));
        // }
        next();
    }
}