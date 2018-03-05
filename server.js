const express = require('express');
const request = require('request');

var app = express();

app.use(express.static(__dirname + '/public'));

app.listen(8080, () => {
  console.log('Server is up on the port 8080');
})
