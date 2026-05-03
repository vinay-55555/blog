// getting-started.js
require("dotenv").config({path:'../.env'});
const mongoose = require('mongoose');
const Schema =mongoose.Schema;
const Data = require("./data.js")
const Blog = require("../model/blogs.js");




const adddata  = async()=>{
  let deletes = await Blog.deleteMany({});
  let blogs = Data.map((e)=>({...e,owner:"69f6e42a30d52f8f17737bdc"}))
    let adding = await Blog.insertMany(blogs)
}
adddata()