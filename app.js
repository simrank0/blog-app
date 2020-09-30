var express             = require("express"),
    methodOverride      = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    bodyParser          = require("body-Parser"),
    mongoose            = require("mongoose"),
    app                 = express();

mongoose.connect("mongodb://localhost/restful_blog_app", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
.then(()=>console.log("Connected to DB!"))
.catch(error=>console.log(error));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

app.get("/", (req,res)=>{
    res.redirect("/blogs");
});

app.get("/blogs", (req,res)=>{
    Blog.find({}, (err, blogs)=>{
        if(!err){
            res.render("index.ejs", {blogs: blogs});
        }else{
            console.log("Something went wrong");
        }
    });
});

app.get("/blogs/new",(req,res)=>{
    res.render("new.ejs");
});

app.post("/blogs", (req,res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (err,newBlog)=>{
        if(!err){
            res.redirect("/blogs/:id");
        }else{
            res.render("new.ejs");
        }
    });
});

app.get("/blogs/:id",(req,res)=>{
    Blog.findById(req.params.id, (err, foundBlog)=>{
        if(!err){
            res.render("show.ejs", {blog: foundBlog});
        }else{
            res.redirect("/");
        }
    });
});

app.get("/blogs/:id/edit",(req,res)=>{
    Blog.findById(req.params.id, (err, foundBlog)=>{
        if(!err){
            res.render("edit.ejs", {blog: foundBlog});
        }else{
            res.redirect("/");
        }
    });
});

app.put("/blogs/:id", (req,res)=>{
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err,updatedBlog)=>{
        if(!err){
            res.redirect("/blogs/" + req.params.id);
        }else{
            res.redirect("/blogs");
        }
    });
});

app.delete("/blogs/:id", (req,res)=>{
    Blog.findByIdAndDelete(req.params.id, (err)=>{
        if(err){
           console.log("couldn't delete"); 
        }else{
            res.redirect("/blogs");
        }
    });
});

app.listen(3000, ()=>{
    console.log("Server is UP and RUNNING!");
});