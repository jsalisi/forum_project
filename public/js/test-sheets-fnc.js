// temporarily testing google sheets functions

var database = require('./google-sheets-functions.js')

/** Test Codes **/

/* Testing Load functionality */
database.loadPosts().then((posts) => {
  for (var i=0; i<posts.length; i++) {
    console.log(posts[i].user);
    console.log(posts[i].post);
  }
});

/* Testing add user functionality */
database.addNewUser('stephen', 'stevepass10', 'standard').then((result) => {
  console.log(result);
});

var test_post = "Hi, my name is Stephen!"

/* Testing add post functionality */
<<<<<<< HEAD
database.addNewPost('stephen', 'asdf', test_post).then((result) => {
=======
database.addNewPost('stephen', 'new post', test_post).then((result) => {
>>>>>>> 22b07270992b98f821f26e5c431d37146d73b8ba
  console.log(result);
}).catch((error) => {
  console.log(error);
});

/* Testing login functionality */
database.login("admin", "P@ssw0rd").then((results) => {
  console.log(results);
}).catch((error) => {
  console.log(error);
});
