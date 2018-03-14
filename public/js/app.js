// TODO: nodejs fuctionality needs to be changed
// nodejs cannot do client side fuctions such as document as seen below

//var database = require('./google-sheets-functions.js');

var single_post = document.getElementById("test_paragraph");
var button = document.getElementById("register");

button.addEventListener("click", function() {
  alert("WORKS");
});

// database.loadPosts().then((post) => {
//   console.log(post[0].post);
//   single_post.innerHTML = post[0].post;
// }).catch((error) => {
//   console.log(error);
//   console.log("Didn't work");
// });
