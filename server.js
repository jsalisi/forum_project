// Requiring additional functions
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const hbs = require('hbs');

// Importing file to access the Google Spreadsheet database
const database = require('./public/js/google-sheets-functions.js');
const urlencodedParser = bodyParser.urlencoded({ extended: false});

// Initializing express
var app = express();

app.use(express.static(__dirname + '/public'));


// Set views folder to be available for use
// Set the view engine to use .hbs files for the template format
app.set('views', './views');
app.set('view engine', 'hbs');

// registering Partials
hbs.registerPartials(__dirname + '/views/partials/homePartials');
hbs.registerPartials(__dirname + '/views/partials/monhunPartials');
hbs.registerPartials(__dirname + '/views/partials/communityPartials');


//*********************************Rendering*******************************//

// rendering home page
app.get('/home', (request, response) => {
  database.loadPosts().then((post) => {
    console.log('Loading posts...');
    response.render('index.hbs', {thread: post});
  }).catch((error) => {
    response.send(error);
  });
});

// rendering post topic list page
app.get('/postThread', (request, response) => {
    response.render('postThread.hbs', {})
});

// posting thread to gs
app.post('/postResult', urlencodedParser, (request, response) => {
    var datetime = new Date();
    database.addNewThread('justin', request.body.topTitle, request.body.topContent, datetime).then((results) => {
      database.addNewPost(results.user, datetime, results.thread_post, results.thread_num).then((result) => {
        console.log(result);
        response.redirect('/home');
      }).catch((error) => {
        response.send(error);
      });
    }).catch((error) => {
      response.send(error);
    });
});

// TODO: Post to thread

app.get('/register', (request, response) => {
    response.render('register.hbs', {})
});

app.post('/postReg', urlencodedParser, (request, response) => {
    if (request.body.new_pass === request.body.confirm_pass){
        database.addNewUser(request.body.new_user, request.body.new_pass, 'standard').then((result) => {
          console.log(result);
        });
        response.redirect('/home');
    } else {
        response.render('register.hbs', {})
        console.log("no accounts registered")
    }
});

app.param('name', (request, response, next, name) => {
  // TODO: stuff
  next();
});

app.get('/:name', (request, response) => {
  response.render('discussion_thread.hbs', {
    title: 'Title',
    stats: '',
    recent: 'Last Post',
    username: 'justin',
    number: '1',
    userpost: 'this is a meme',
    topic: 'How do I play this game?'
  });
});

//****************************Server***************************************//
app.listen(8080, () => {
  console.log('Server is up on the port 8080');
});
