const express = require('express'),
morgan = require('morgan'),
bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose'); 
const Models = require('./models.js'); 
const passport = require('passport');
require('./passport');
const cors = require('cors');
const { check, validationResult } = require('express-validator');
const Movies = Models.Movie; 
const Users = Models.User; 
const Genres = Models.Genre; 
const Directors = Models.Director; 

// Integrating Mongoose with a REST API
//mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('bufferCommands', false);
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(morgan('common'));
app.use(express.static('public')); /* Use express.static to serve your “documentation.html” file from the
public folder (rather than using the http, url, and fs modules). */
app.use(bodyParser.json());
let auth = require('./auth')(app);

// Listing only allowed domain to be allowed access
let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234', 'http://testsite.com'];
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// default text response
app.get('/', (req, res) => {
    res.send('Welcome to my movie API!');
});

// return JSON object when at /movies 
//app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
//    Movies.find()
//        .then((movies) => {
//            res.json(movies);
//        })
//        .catch((err) => {
//            console.error(err);
//            res.status(500).send('Error: ' + err);
//        });
//});
// removed the authentication for a demostration
app.get("/movies", function (req, res) {
  Movies.find()
    .then(function (movies) {
      res.status(201).json(movies);
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Get the data of a movie, by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.title })
        .then((movie) => {
            res.status(201).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get the movie description by genre
app.get('/movies/genres/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
    
 Movies.findOne({ "Genre.Name": req.params.name})
   .then((movie) => {
            res.status(201).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Gets the data of a director
app.get('/movies/directors/:name', passport.authenticate('jwt', { session: false }), (req, res) => {

    Movies.findOne({ "Director.Name": req.params.name})
   .then((movie) => {
            res.status(201).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Adds a new movie (with data) to our list of movies
app.post('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log(req.body)
    Movies.findOne({ Title: req.body.Title })
        .then((movie) => {
            if (movie) {
                return res.status(400).send(req.body.Title + 'already exists');
            } else {
                console.log(req.body.Title)
                 Movies
                     .create({
                         Title: req.body.Title,
                         Description: req.body.Description,
                         
                      })
                     .then((movie) => {res.status(201).json(movie) })
                 .catch((error) => {
                     console.error(error);
                     res.status(500).send('Error: ' + error);
                 })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// Delete a movie from list, by title
app.delete('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
Movies.findOneAndRemove({ Title: req.params.title }) // Finds a movie by title and removes them from the database
      .then((movie) => {
          if (!movie) {
              res.status(400).send(req.params.title + ' was not found'); // Shown if movie title was not found in database
          } else {
              res.status(200).send(req.params.title + ' was deleted.'); // Shown if the movie title was found in the database and removed
          }
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
    });

// Get all users 
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
        .then((users) => {
        res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get the data of a user, by username
app.get('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.username })
        .then((user) => {
            res.status(201).json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Add a new user (with data) to our list of users
app.post('/users', 
    [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
     let hashedPassword = Users.hashPassword(req.body.Password);
    console.log(req.body)
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + 'already exists');
            } else {
                console.log(req.body.Username)
                Users
                    .create({
                        Username: req.body.Username,
                        Email: req.body.Email,
                        Password: hashedPassword,
                        Birthday: req.body.Birthday
                     })
                    .then((user) => {res.status(201).json(user) })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
  });

// Delete a user by username
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
 Users.findOneAndRemove({ Username: req.params.username }) // Finds a user by username and removes them from the database
      .then((user) => {
          if (!user) {
              res.status(400).send(req.params.username + ' was not found'); // Shown if username was not found in database
          } else {
              res.status(200).send(req.params.username + ' was deleted.'); // Shown if the username was found in the database and removed
          }
 })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});  

// Update user information
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), [
	check('Username', 'Username is required').isLength({min: 5}),
	check('Username', 'Username contains non alphanumeric characters- not allowed.').isAlphanumeric(),
	check('Password', 'password is required').not().isEmpty(),
	check('Email', 'Email does not appear to be valid').isEmail()
	],(req, res) => {
    let hashPassword = Users.hashPassword(req.body.Username);
  Users.findOneAndUpdate({ Username: req.params.Username }, 
       {  
   $set:{ 
      Username: req.body.Username,
      Password: req.body.hashPassword ,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
