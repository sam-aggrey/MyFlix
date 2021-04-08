const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser');
//    uuid = require('uuid');

const app = express();

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

// Get the list movies
app.get('/movies', (req, res) => {
    res.json(movies);
});

// Get the data of a movie, by title
app.get('/movies/:title', (req, res) => {
    res.json(movies.find((movie) =>
      { return movie.title === req.params.title }));
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
      newMovie.id = uuid.v4();
      movies.push(newMovie);
      res.status(201).send(newMovie);
     // res.status(404).send("Cound not find the director!");
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
        "name": "April",
        "email": "april@web.de",
    }
];

// Get list of users
app.get('/users', (req, res) => res.json(users));

// Add a new user (with data) to our list of users
app.post('/users', (req, res) => {
    let newUser = req.body;
  
    if (!newUser.name) {
      const message = 'Missing name in request body';
      res.status(400).send(message);
    } else {
      newUser.id = uuid.v4();
      users.push(newUser);
      res.status(201).send(newUser);
    }
});

// Delete a user from list, by name
app.delete('/users/:name', (req, res) => {
    let user = users.find((user) => { return user.name === req.params.name });
  
    if (user) {
        users = users.filter((obj) => { return obj.name !== req.params.name });
        res.status(201).send('User ' + req.params.name + ' was deleted.');
    }
});

// Update the "name" of a user
app.put('/users/:name', (req, res) => {
    res.send('Thank you for updating your username!');
});

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});


/* app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super top-secret content.');
}); */
  
/* app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
});*/