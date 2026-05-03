// getting-started.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("../model/review.js");
const User = require("../model/user.js");



const blogSchema = new Schema({
    name :String,
    age : Number,
    title:String,
    publishedYear:Number,
    blog:String,
    review :[
      {
       type: Schema.Types.ObjectId,
        ref: 'Review' 
       
      }
    ],
    owner:{
       type: Schema.Types.ObjectId,
        ref: 'User' 
       
    }
});

module.exports = mongoose.model("Blog",blogSchema);
