const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser');
   // uuid = require('uuid');

const app = express();
const mongoose = require('mongoose'); 
const Models = require('./models.js'); 

const Movies = Models.Movie; 
const Users = Models.User; 
const Genres = Models.Genre; 
const Directors = Models.Director; 

// Integrating Mongoose with a REST API
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

let movies = [
    {
        title: 'The Lord of the Rings: The Return of the King',
        director: {
            name: 'Peter Jackson',
            birthyear: 1961,
            deathyear: 'Not applicable',
            bio: 'Peter Jackson was born as an only child in a small coast-side town in New Zealand in 1961.',
        },
        genre: ['Action', 'Adventure', 'Drama'],
        year: 2003,
        imdbrank: 1
    },
    {
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        director: {
            name: 'Peter Jackson',
            birthyear: 1961,
            deathyear: 'Not applicable',
            bio: 'Peter Jackson was born as an only child in a small coast-side town in New Zealand in 1961.',
        },
        genre: ['Action', 'Adventure', 'Drama'],
        year: 2001,
        imdbrank: 2
    },
    {
        title: 'The Lord of the Rings: The Two Towers',
        director: {
            name: 'Peter Jackson',
            birthyear: 1961,
            deathyear: 'Not applicable',
            bio: 'Peter Jackson was born as an only child in a small coast-side town in New Zealand in 1961.',
        },
        genre: ['Action', 'Adventure', 'Drama'],
        year: 2002,
        imdbrank: 3
    },
    {
        title: 'Star Wars: Episode V - The Empire Strikes Back ',
        director: {
            name: 'Irvin Kershner',
            birthyear: 1923,
            deathyear: 2010,
            bio: 'Irvin Kershner was born on April 29, 1923 in Philadelphia, Pennsylvania. A graduate of the University of Southern California film school, Kershner began his career in 1950, producing documentaries for the United States Information Service in the Middle East.',
        },
        genre: ['Action', 'Adventure', 'Fantasy'],
        year: 1980,
        imdbrank: 4
    },
    {
        title: 'Spirited Away',
        director: {
            name: 'Hayao Miyazaki',
            birthyear: 1941,
            deathyear: 'Not applicable',
            bio: 'Hayao Miyazaki is one of the greatest animation directors in Japan. The entertaining plots, compelling characters, and breathtaking animation in his films have earned him international renown from critics as well as public recognition within Japan.',
        },
        genre: ['Action', 'Adventure', 'Family'],
        year: 2001,
        imdbrank: 5
    }
];

// Middleware
app.use(morgan('common'));
app.use(express.static('public')); /* Use express.static to serve your “documentation.html” file from the
public folder (rather than using the http, url, and fs modules). */
app.use(bodyParser.json());
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
}); /* an error-handling middleware function that will log all application-level
  errors to the terminal */

// Create the route for the requests, including a response that indicates the action
/* app.get('/movies', (req, res) => {
    res.send('Successful GET request returning data on all the movies.');
  }); */

// default text response
app.get('/', (req, res) => {
    res.send('Welcome to my movie API!');
});



// return JSON object when at /movies 
app.get('/movies', (req, res) => {
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
    Movies.findOne({ title: req.params.title })
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
    let movieList = movies.filter((movie) => { return movie.genre.includes(req.params.name) });
    res.json(movieList);
    //res.send('Here is a description of the ________ movie genre!');
});

// Get the movie description by genre
app.get('/movies/multigenres/:names', (req, res) => {
    // "action+drama+fantasy"
    let genres = req.params.names.split("+"); // ["action", "drama", "fantasy"]
    let movieList = movies.filter((movie) => { return genres.every((genre) => { return movie.genre.includes(genre)}) });
    res.json(movieList);
    //res.send('Here is a description of the ________ movie genre!');
});

// Gets the data of a director
app.get('/movies/directors/:name', (req, res) => {
    let matchMovie = movies.find((movie) => { return movie.director.name === req.params.name });
    
    if (matchMovie) {
        res.json(matchMovie.director);
    } else {
        res.status(404).send("Cound not find the director!");
    }
    //res.send('Here is the data of the director!');
});

// Adds a new movie (with data) to our list of movies
app.post('/movies', (req, res) => {
    
    let newMovie = req.body;
  
    if (!newMovie.title) {
      const message = 'Missing title in request body';
      res.status(400).send(message);
    } else {
      //newMovie.id = uuid.v4();
      movies.push(newMovie);
      res.status(201).send(newMovie);
    }
});

// Delete a movie from list, by title
app.delete('/movies/:title', (req, res) => {
    let movie = movies.find((movie) => { return movie.title === req.params.title });
  
    if (movie) {
        movies = movies.filter((obj) => { return obj.title !== req.params.title });
        res.status(201).send('Movie ' + req.params.title + ' was deleted.');
    }
  });

let users = [
    {
        "username": "Dave Asante",
        "email": "daveasante.gmail.com",
        "password": 1251,
        "birthday": "04/30/1984"
    },
    {
        "username": "Joseph Mensah",
        "email": "joemens@yahoo.com",
        "password": 1284,
        "birthday": "05/31/1984"
    },
    {
        "username": "Steve Martins",
        "email": "Stevemart@hotmail.com",
        "password": 1234,
        "birthday": "07/30/1984"
    }
];


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
    Movies.findOne({ UserName: req.params.UserName })
        .then((movie) => {
            res.status(201).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});



// Add a new user (with data) to our list of users
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.username + 'already exists');
            } else {
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
 Users.findOneAndRemove({ Username: req.params.Username }) // Finds a user by username and removes them from the database
      .then((user) => {
          if (!user) {
              res.status(400).send(req.params.Username + ' was not found'); // Shown if username was not found in database
          } else {
              res.status(200).send(req.params.Username + ' was deleted.'); // Shown if the username was found in the database and removed
          }
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});  

// Update the "name" of a user
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
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

