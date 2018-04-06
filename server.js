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
    response.render('index.hbs', {
        title: 'Title/Thread Starter',
        stats: 'Replies/Views',
        recent: 'Last Post By'
    });
  }).catch((error) => {
    response.send(error);
  });
});

// rendering monhun topic list page
app.get('/monhun', (request, response) => {
  database.loadPosts().then((post) => {
    response.render('monhun.hbs', {
        title: 'Title/Thread Starter',
        stats: 'Replies/Views',
        recent: 'Last Post By'
    });
  }).catch((error) => {
    response.send(error);
  });
});

// rendering community topic list page
app.get('/community', (request, response) => {
  database.loadPosts().then((post) => {
    response.render('community.hbs', {
        title: 'Title/Thread Starter',
        stats: 'Replies/Views',
        recent: 'Last Post By'
    });
  }).catch((error) => {
    response.send(error);
  });
});

// rendering post topic list page
app.get('/postThread', (request, response) => {
    response.render('postThread.hbs', {
        title: 'Title/Thread Starter',
        stats: 'Replies/Views',
        recent: 'Last Post By'
    })
});

app.post('/postResult', urlencodedParser, (request, response) => {
    database.addNewPost('stephen', request.body.topTitle, request.body.topContent).then((result) => {
      console.log(result);
    }).catch((error) => {
      console.log(error);
    })
    response.render('index.hbs', {
        title: 'Title',
        stats: '',
        recent: 'Last Post'
    });
})


//****************************Server***************************************//
app.listen(8080, () => {
  console.log('Server is up on the port 8080');
});
