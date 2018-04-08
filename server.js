// Requiring additional functions
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const hbs = require('hbs');

const port = process.env.PORT || 8080;

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

// rendering home page.
// refer to google-sheets-functions.js for .loadPosts()
app.get('/home', (request, response) => {
  database.loadPosts(2).then((post) => {
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
app.get('/newPost', (request, response) => {
    response.render('createPost.hbs', {})
});

app.post('/newPostResult', urlencodedParser, (request, response) => {
  var datetime = new Date();
  // TODO: Need to post to the thread that's click on
  // TODO: Need to have real user's username passed through
  database.addNewPost('justing', datetime, request.body.topContent, 5).then((result) => {
    console.log(result);
    response.redirect('/home');
  }).catch((error) => {
    response.send(error);
  });
})

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
  var topic_title = name.replace(/_/g, ' ');
  request.name = topic_title;
  next();
});


//NOTE: post_sheet has other data on it that can be used to show posts.
//      only username and post is used so far.
//      refer to loadPosts() in google-sheets-functions.js
app.get('/:name', (request, response) => {
  database.loadPosts(2).then((threadlist) => { //get the sheetnumber using param
    for (var x in threadlist) {
      if (threadlist[x].topic_link == response.req.params.name) {
        return threadlist[x].sheet_num; //returns sheet number
      }
    }
  }).then((sheet_number) => {
    return database.loadPosts(sheet_number) //gets the sheet and return
  }).then((post_sheet) => {
    response.render('discussion_thread.hbs', {
      topic: response.req.params.name.replace(/_/g," "),
      posts: post_sheet})
  }).catch((error) => {
    response.send(error);
  });
});

//****************************Server***************************************//
app.listen(port, () => {
  console.log('Server is up on the port 8080');
});
