/**
 * @type {object} express - requires express module
 * @type {object} request - requires request module
 * @type {object} bodyParser - requires bodyParser module
 * @type {object} hbs - requires hbs module
 * @type {object} session - requires session module
 * @type {object} passport - requires passport module
 * @type {object} cookieParser - requires cookieParser module
 * @type {object} port - sets listening port to 8080
 */
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 8080;

/**
 * @type {object} database - requires from google-sheets-functions.js to setup database
 * @type {object} urlencodedParser - calls on bodyParser.urlencoded{{extended:false}} for form posting
 */
// Importing file to access the Google Spreadsheet database
const database = require('./public/js/google-sheets-functions.js');
const urlencodedParser = bodyParser.urlencoded({ extended: false});

/**
 * @type {type} app - sets app to call on express() initialization
 */
var app = express();

/**
 * @param {object} express.static - set up app.use so that it uses html related files from that directory
 * @param {string} __dirname - folder path
 */
app.use(express.static(__dirname + '/public'));
/*app.use(passport.initialize());
app.use(cookieParser());
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialzed: true
}));
app.use(passport.session());*/

/**
 * @param {string} views sets - views from the views directory
 * @type {string} view engine - set sets view engine from the module hbs
 */
app.set('views', './views');
app.set('view engine', 'hbs');

/**
 * @param {string} __dirname - registering partials in following paths
 */
hbs.registerPartials(__dirname + '/views/partials/homePartials');
hbs.registerPartials(__dirname + '/views/partials/monhunPartials');
hbs.registerPartials(__dirname + '/views/partials/communityPartials');

/**
 * @param {string} current_user - current user flag
 * @param {number} login_flag - flags for login status will be removed later
 * @param {number} brower_flag - flags for browser status used for partial swaps
 * @param {string} dupe_comment - comment for error if dupe user detected when trying to register a new user
 * @param {string} current_sheet - sets the current google spreadsheet for thread link
 * @param {string} redir_page - sets varable for redirect after login
 */
var current_user = '';
var login_flag = 0;
var browser_flag = 0;
var dupe_comment = '';
var current_sheet = '';
var redir_page = '';

/**
 * @returns {string} returns login_flag for banner
 */
hbs.registerHelper('getBanner', () => {
    if (login_flag === 0) {
        return 'topBanner'
    } else {
        return 'logBanner'
    }
});

/**
 * @returns {string} returns the login_flag for setlogcheck which is a string
 */
hbs.registerHelper('setLoginCheck', () => {
    return login_flag;
});

/**
 * @return {string} returns the username of the current login user
 */
hbs.registerHelper('getUser', () => {
    return current_user;
});

/**
 * @return {string} returns the error comment when detecting dupe username when registering
 */
hbs.registerHelper('getDupe', () => {
    return dupe_comment;
});

/**
 * @return {number} returns a number for browser flag. so it renders the correct banner partial
 */
hbs.registerHelper('setBrowserFlag', () => {
    return browser_flag;
});

/**
 * @param {string} '/' - root action script, when '/' is called upon for port 8080
 * @param {object} request - request object from user
 * @param {object} response - what our respons will be, when '/' is requested
 */
app.get('/', (request, response) => {
  /**
   * @param {string} '/home' - our respons will redirect to '/home' action script
   */
  response.redirect('/home');
});

/**
 * @param {string} '/home' - what app.get will take action upon when '/home' is called
 * @param {object} request - request object from user
 * @param {object} response - what our response will be, when '/home' is called
 */
app.get('/home', (request, response) => {
  database.loadPosts(2).then((post) => {
    console.log('Loading posts...');

    /**
     * @param {string} 'index.hbs' - 'index.hbs' template will be rendered, when '/home' is requested for script action
     * @param {object} thread - where thread will be rendered for post partial when index.hbs is rendered
     */
    response.render('index.hbs', {
        thread: post
    });
  }).catch((error) => {
    /**
     * throws {error} throw error when request catches error
     */
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
        response.redirect(`/${results.link}`);
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
  var threadname;
  database.loadPosts(2).then((threadlist) => { //get the sheetnumber using param
    for (var x in threadlist) {
      if (threadlist[x].topic_link == response.req.params.name) {
        threadname = threadlist[x].thread_name;
        return threadlist[x].sheet_num; //returns sheet number
      }
    }
  }).then((sheet_number) => {
    return database.loadPosts(sheet_number) //gets the sheet and return
  }).then((post_sheet) => {
    response.render('discussion_thread.hbs', {
      topic: threadname,
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
