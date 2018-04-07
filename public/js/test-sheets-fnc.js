// temporarily testing google sheets functions
// Uncomment functions to test

var database = require('./google-sheets-functions.js')

/** Test Codes **/

/* Testing Load functionality */
// database.loadPosts().then((posts) => {
//   for (var i=0; i<posts.length; i++) {
//     console.log(posts[i].user);
//     console.log(posts[i].post);
//   }
// });

/* Testing add user functionality */
// database.addNewUser('stephen', 'stevepass10', 'standard').then((result) => {
//   console.log(result);
// });

var test_post = "Hi, my name is Stephen!"

/* Testing add post functionality */
// database.addNewPost('stephen', 'new post', test_post, 5).then((result) => {
//   console.log(result);
// }).catch((error) => {
//   console.log(error);
// });

/* Testing login functionality */
// database.login("admin", "P@ssw0rd").then((results) => {
//   console.log(results);
// }).catch((error) => {
//   console.log(error);
// });

/* Testing new thread functionality */
// database.addNewThread('justin', 'How do?', test_post, '69:69').then((results) => {
//   database.addNewPost(results.user, '22:19 apr 6, 2018', results.thread_post, 3).then((result) => {
//     console.log(result);
//   }).catch((error) => {
//     console.log(error);
//   });
// }).catch((error) => {
//   console.log(error);
// });
