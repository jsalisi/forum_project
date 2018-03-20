const express = require('express');
const request = require('request');
const hbs = require('hbs');

const database = require('./public/js/google-sheets-functions.js');

var app = express();

app.use(express.static(__dirname + '/public'));

app.set('views', './views');
app.set('view engine', 'hbs');

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
