const mongoose = require("mongoose");

const connectDatabase = () => {
    mongoose
        .connect('mongodb+srv://gali76682:V9Szta0rQYoG8q1o@cluster0.k4bojvw.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log("Mongoose Connected");
        });
};

module.exports = connectDatabase;