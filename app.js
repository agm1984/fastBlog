var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var expressSanitizer = require('express-sanitizer');

// Server Config
var config = {};
config.port = 3000;
config.host = "localhost";
config.db = "mongodb://" + config.host + "/fast_blog";
mongoose.connect(config.db); // Load Mongoose
app.use(bodyParser.urlencoded({ extended: true })); // Load Body-parser
app.use(methodOverride("_method")); // Load Method-override (used for PUT and DELETE Routes)
app.use(expressSanitizer()); // Load Express-sanitizer (used for sanitizing blog post content)
// Set templating engine and public assets directory
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Define Blog Model
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now() }
});
var Blog = mongoose.model('Blog', blogSchema);

// Seed data
// Blog.create({
//     title: "This is a test blog",
//     image: "https://s-media-cache-ak0.pinimg.com/originals/77/7a/df/777adf082fc125aa9490a3450192ec6c.jpg",
//     body: "This is the test body for the test blog we are throwing down now"
// });


// Root Redirect Route
app.get('/', function(req, res) {
    res.redirect('/blogs');
});

// Listview Route
app.get('/blogs', function(req, res) {
    Blog.find({}, function(err, blogs) {
        if (err) {
            console.log(err);
            res.redirect('/blogs');
        } else {
            res.render('blogs', {
                blogs: blogs
            });
        }
    });

});

// Create Route
app.get('/blogs/new', function(req, res) {
    res.render('new');
});

// Post Route
app.post('/blogs', function(req, res) {
    Blog.create({
        title: req.body.title,
        image: req.body.image,
        body: req.sanitize(req.body.body)
    }, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/blogs');
        }
    });
});

// Show Route
app.get('/blogs/:id', function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
            console.log(err);
        } else {
            res.render('show', {
                blog: foundBlog
            });
        }
    });
});

// Edit Route
app.get('/blogs/:id/edit', function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
            console.log(err);
        } else {
            res.render('edit', {
                blog: foundBlog
            });
        }
    });
});

// Put Route
app.put('/blogs/:id', function(req, res) {
    req.body.blog = req.sanitize(req.body.blog);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/blogs/' + req.params.id);
        }
    });
});

// Delete Route
app.delete('/blogs/:id', function(req, res) {
    Blog.findByIdAndRemove(req.params.id, function(err) {
      if (err) {
          console.log(err);
      } else {
          res.redirect('/blogs');
      }
    });
});


// Start Server
app.listen(config.port, config.host, function() {
    console.log("Server started on port: " + config.port);
});
