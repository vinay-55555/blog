require("dotenv").config();

const express = require("express");
const app = express();
const Blog = require("./model/blogs.js")
const Review = require("./model/review.js");
const User = require("./model/user.js");
const methodOverride = require("method-override");
const mongoose = require("mongoose")

const session = require("express-session");
const MongoStore = require("connect-mongo");


const flash = require("connect-flash");
const passport = require("passport");
const LocalStrtegy = require("passport-local");



let dburl = process.env.URL
console.log(dburl)



main().then(()=>console.log("connect in cloud"))
.catch(err => console.log(err));
async function main() {
  await mongoose.connect(dburl);
//   use `await mongoose.connect('mongodb://:password@127.0.0.1:27017/test');` if your database has auth enabled
}


app.set("view-engine","views")
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"))
app.use(session({secret:"abcdefgh",
    resave:false,
    saveUninitialized:true,
     store:MongoStore.create({mongoUrl:dburl})
}))
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrtegy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.msg = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user
    next()
})

app.get("/",(req,res)=>{
    res.redirect("/blog")
})

app.get("/blog",async (req,res)=>{ 
    let alldata = await Blog.find();
  res.render("home.ejs",{alldata})
})

app.get("/blog/new",(req,res)=>{
 
    if(!req.isAuthenticated()){
               req.session.redirect = req.originalUrl;
        req.flash("success","first you need login")
        return res.redirect("/blog/login")
    }
    res.render("new.ejs")
});

const redirecturl = (req,res,next)=>{
        if(req.session.redirect){
     res.locals.redirect = req.session.redirect
        }
        next()
        
}
app.post("/blog",async(req,res)=>{
    let alldata = req.body.blogs;
    console.log(req.user)
      alldata.owner = req.user._id;
   let addadata = await Blog.insertOne(alldata);

   res.redirect("/blog")
})

app.get("/blog/:id/show",async(req,res)=>{
    let{id} = req.params;
    let alldata = await Blog.findById(id).populate("review").populate("owner");
    console.log(alldata)
    res.render("show.ejs",{alldata})

});

app.get("/blog/:id/edit",async(req,res)=>{
   let {id} = req.params;
   let alldata =  await Blog.findById(id);
   res.render("edit.ejs",{alldata})
});

app.put("/blog/:id",async (req,res)=>{
    let{id} = req.params;
    let data = req.body.blogs;
    let finds = await Blog.findById(id);
      if(!  res.locals.currUser._id.equals(finds.owner._id)){
         req.flash("success","you does not have access to change")
         return res.redirect(`/blog/${id}/show`);
      }

    let update =  await Blog.findByIdAndUpdate(id,{...data})
    req.flash("success","you have edited the blog")
    res.redirect(`/blog/${id}/show`)
});

app.delete("/blog/:id",async(req,res)=>{
    let{id} = req.params;
    let  deletes = await Blog.findByIdAndDelete(id);
    res.redirect("/blog")


});

// review routes

app.post("/blog/:id/reviews",async (req,res)=>{
    let {id} = req.params;
    let data = req.body;
    let blog = await Blog.findById(id);
    let review = await Review.insertOne(data);
    let addreview = await blog.review.push(review);
    await blog.save()
    res.redirect(`/blog/${id}/show`)
   
})

app.delete("/blog/:id/reviews/:reviewId",async(req,res)=>{
    let{id} = req.params;
    let{reviewId} = req.params;
    let reviewfromblog = await Blog.findByIdAndUpdate(id,{$pull:{review:reviewId}})
    let deletes = await Review.findByIdAndDelete(reviewId);
    res.redirect(`/blog/${id}/show`)
});



// authenticate routes;

app.get("/blog/signup",(req,res)=>{
    res.render("signup.ejs")
})
app.post("/signup",async (req,res,next)=>{
    let{username,email,password} = req.body;
     let adduser = await new User({username,email});
    let authenticate =  await User.register(adduser,password);
     req.login(authenticate,(err)=>{
        if(err){
            next(err)
        }else{
            req.flash("success","your signup complete do not need log in you are login as well")
             res.redirect("/blog")
        }
     })

});

app.get("/blog/login",(req,res)=>{
    res.render("login.ejs");
})

// app.post("/login",saveredirecturl,passport.authenticate("local",{
//     failureRedirect:"dogs/login",
//     failureFlash:true,
// }), async(req,res)=>{
//   req.flash("success","you are log in now");
//   let check = res.locals.redirecturl || "/dogs/all"
//   res.redirect( check )
  
// })

app.post("/login",redirecturl,passport.authenticate('local',
    {failureRedirect:"/blog",failureFlash:true}) ,
 async (req,res)=>{
   req.flash("success","your are log in now")
   let paths = res.locals.redirect||"/blog"
   res.redirect(paths);
})


app.get("/blog/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err)
        }else{
            req.flash("success","you are logout ");
            res.redirect("/blog")
        }
    })
})

app.listen(8080,(req,res)=>{
    console.log("server is listing to")
})