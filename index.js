const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser');

   // uuid = require('uuid');
const app = express();
const mongoose = require('mongoose'); 
const Models = require('./models.js'); 
const passport = require('passport');
require('./passport');


const Movies = Models.Movie; 
const Users = Models.User; 
const Genres = Models.Genre; 
const Directors = Models.Director; 

// Integrating Mongoose with a REST API
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });



// Middleware
app.use(morgan('common'));

app.use(express.static('public')); /* Use express.static to serve your “documentation.html” file from the
public folder (rather than using the http, url, and fs modules). */
app.use(bodyParser.json());
let auth = require('./auth')(app);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// default text response
app.get('/', (req, res) => {
    res.send('Welcome to my movie API!');
});



// return JSON object when at /movies 
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


// Get the data of a movie, by title
app.get('/movies/:title', (req, res) => {
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
app.get('/movies/genres/:name', (req, res) => {
    
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
app.get('/movies/directors/:name', (req, res) => {

    Movies.findOne({ "Director.Name": req.params.name})
   .then((movie) => {
            res.status(201).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    
    //res.send('Here is the data of the director!');
});



// Adds a new movie (with data) to our list of movies
app.post('/movies', (req, res) => {
    
//    let newMovie = req.body;
//  
//    if (!newMovie.title) {
//      const message = 'Missing title in request body';
//      res.status(400).send(message);
//    } else {
//      //newMovie.id = uuid.v4();
//      movies.push(newMovie);
//      res.status(201).send(newMovie);
//    }
    
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
app.delete('/movies/:title', (req, res) => {

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
app.get('/users', (req, res) => {
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
app.get('/users/:username', (req, res) => {
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
app.post('/users', (req, res) => {
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
                        Password: req.body.Password,
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
app.delete('/users/:username', (req, res) => {
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

// Update the "name" of a user
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, 
      
     {  
   
      $set:{ 
    
      Username: req.body.Username,
      Password: req.body.Password,
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
app.post('/users/:Username/Movies/:MovieID', (req, res) => {
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
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

