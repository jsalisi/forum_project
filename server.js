// Requiring additional functions
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 8080;


// Importing file to access the Google Spreadsheet database
const database = require('./public/js/google-sheets-functions.js');
const urlencodedParser = bodyParser.urlencoded({ extended: false});

// Initializing express
var app = express();

app.use(express.static(__dirname + '/public'));
/*app.use(passport.initialize());
app.use(cookieParser());
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialzed: true
}));
app.use(passport.session());*/

// Set views folder to be available for use
// Set the view engine to use .hbs files for the template format
app.set('views', './views');
app.set('view engine', 'hbs');

// registering Partials
hbs.registerPartials(__dirname + '/views/partials/homePartials');
hbs.registerPartials(__dirname + '/views/partials/monhunPartials');
hbs.registerPartials(__dirname + '/views/partials/communityPartials');

// helpers
var current_user = '';
var login_flag = 0;
var browser_flag = 0;
var dupe_comment = '';
var current_sheet = '';
var redir_page = '';

hbs.registerHelper('getBanner', () => {
    if (login_flag === 0) {
        return 'topBanner'
    } else {
        return 'logBanner'
    }
});

hbs.registerHelper('setLoginCheck', () => {
    return login_flag;
});

hbs.registerHelper('getUser', () => {
    return current_user;
});

hbs.registerHelper('getDupe', () => {
    return dupe_comment;
});

hbs.registerHelper('setBrowserFlag', () => {
    return browser_flag;
});


//*********************************Rendering*******************************//

passport.deserializeUser(function(id, done) {
    done(err, user);
});


// Redirecting '/' to Home Page
app.get('/', (request, response) => {
  response.redirect('/home');
});

// rendering home page.
// refer to google-sheets-functions.js for .loadPosts()
app.get('/home', (request, response) => {
  database.loadPosts(2).then((post) => {
    console.log('Loading posts...');
    response.render('index.hbs', {
        thread: post
    });
  }).catch((error) => {
    response.send(error);
  });
});

// login cred check
app.get('/relog', (request, response) => {
  response.render('relogin.hbs')
});

app.post('/checkCred', urlencodedParser, (request, response) => {
    database.login(request.body.user, request.body.pass).then((results) => {
      if (results === 'yes') {
          current_user = request.body.user
          login_flag = 1
          //if (request.body.remember === 'True'){
          //}
          response.redirect('/home')
      } else {
          response.redirect('/relog')
      }

    }).catch((error) => {
      console.log(error);
    });
});

// logout
app.post('/logOut', urlencodedParser, (request, response) => {
    current_user = ''
    login_flag = 0
    response.redirect('/home')
});

// rendering post topic list page
app.get('/postThread', (request, response) => {
    response.render('postThread.hbs', {})
});

// posting thread to gs
app.post('/postResult', urlencodedParser, (request, response) => {
    var datetime = new Date();
    database.addNewThread(current_user, request.body.topTitle, request.body.topContent, datetime).then((results) => {
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
  database.addNewPost(current_user, datetime, request.body.topContent, current_sheet).then((result) => {
    console.log(result);
    response.redirect(redir_page);
  }).catch((error) => {
    response.send(error);
  });
})

app.get('/register', (request, response) => {
    response.render('register.hbs', {})
});

app.post('/postReg', urlencodedParser, (request, response) => {
    var dupeflag = 0
    database.existcheck(request.body.new_user).then((results) => {
      dupeflag = results;
      console.log(dupeflag)
    }).catch((error) => {
      console.log(error);
    });

    setTimeout (() => {
        if (dupeflag === 'yes') {
            dupe_comment = "Cannot Register Account! Username already taken!!"
            response.render('register.hbs', {})
            console.log("no accounts registered")
        } else if (request.body.new_pass != request.body.confirm_pass) {
            dupe_comment = "Confirmation of password does not match!!"
            response.render('register.hbs', {})
            console.log("no accounts registered")
        } else if ((request.body.new_pass === request.body.confirm_pass) && (dupeflag === 'no')){
            database.addNewUser(request.body.new_user, request.body.new_pass, 'standard').then((result) => {
              console.log(result);
            });
            browser_flag = 1
            response.redirect('/home');
            setTimeout (() => {
                browser_flag = 0
            }, 1000);
        } else {
            response.render('register.hbs', {})
            console.log("no accounts registered")
        }
    }, 1000);
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
      posts: post_sheet});
    current_sheet = post_sheet[0].sheet_num;
    redir_page = response.req.url;
    database.updatePostView(current_sheet);
  }).catch((error) => {
    response.send(error);
  });
});

//****************************Server***************************************//
app.listen(port, () => {
  console.log('Server is up on the port 8080');
});
