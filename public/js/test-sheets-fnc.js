// temporarily testing google sheets functions

var databse = require('./google-sheets-functions.js')

/** Test Codes **/

/* Testing Load functionality */
database.loadPosts().then((posts) => {
  for (var i=0; i<posts.length; i++) {
    console.log(posts[i].user);
    console.log(posts[i].post);
  }
});

/* Testing add user functionality */
database.addNewUser('stephen', 'stevepass6', 'admin').then((result) => {
  console.log(result);
});

var test_post = "Hi, my name is Stephen!"

/* Testing add post functionality */
database.addNewPost('stephen', test_post).then((result) => {
  console.log(result);
}).catch((error) => {
  console.log(error);
});

/* Testing login functionality */
//TODO: write login test code