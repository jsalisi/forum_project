const express = require('express');
const request = require('request');
const database = require('./public/js/google-sheets-functions.js');

var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/test', (request, response) => {
  database.loadPosts().then((post) => {
    response.send(post);
  }).catch((error) => {
    console.log(error);
  });
});

app.listen(8080, () => {
  console.log('Server is up on the port 8080');
});
