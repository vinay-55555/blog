// getting-started.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const reviewSchema = new Schema({
   comment:String
});

module.exports = mongoose.model("Review",reviewSchema);