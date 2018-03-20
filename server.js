// Requiring additional functions
const express = require('express');
const request = require('request');
const hbs = require('hbs');

// Importing file to access the Google Spreadsheet database
const database = require('./public/js/google-sheets-functions.js');

// Initializing express
var app = express();

app.use(express.static(__dirname + '/public'));

app.set('views', './views');
app.set('view engine', 'hbs');

// Currently loading default template post to Monster Hunter announcements
// Passes data from the database through the render parameters
app.get('/home', (request, response) => {
  database.loadPosts().then((post) => {
    response.render('index.hbs', {monhun_post: post[0].post});
  }).catch((error) => {
    console.log(error);
  });
});

app.listen(8080, () => {
  console.log('Server is up on the port 8080');
});
