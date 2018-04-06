// This is a database test for the forum

// Importing Google Spreadheet API
// https://www.npmjs.com/package/google-spreadsheet
const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('./json/client_secret.json'); // API Key

// Spreadsheet ID
const doc = new GoogleSpreadsheet('1cwmWMqAoqzYHhla1vpE_qiV5uQzRfuJ4HoPsfeH6LVk');

// Sheet Number
const USERS_WORKSHEET = 1;
const GD_WORKSHEET = 2;

/*
** Spreadsheet Notes **

  Google Spreadsheets objects are returned with the following format:

  OBJECT[ index / user number ] = {column_name: 'value in column'}

*/

/*
* Loads data from the spreadsheet
*
* @resolve {object} rows - contains the data from the spreadsheet
*/
var loadPosts = () => {
  return new Promise((resolve, reject) => {
    doc.useServiceAccountAuth(creds, function(err) {
      if (err) {
        reject(err);
      } else {
        doc.getRows(GD_WORKSHEET, function(err, rows) {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      }
    });
  });
}

/*
* Appends a post to the spreadsheet
*
* @param {string} user - A username
* @param {string} topic_post - A post created by the user
*/
<<<<<<< HEAD
var addNewPost = (user, topic, topic_post) => {
=======
var addNewPost = (user, topic_title, topic_post) => {
>>>>>>> 22b07270992b98f821f26e5c431d37146d73b8ba
  return new Promise((resolve, reject) => {
    doc.useServiceAccountAuth(creds, function(err) {
      if (err) {
        reject(err);
      } else {
        doc.addRow(GD_WORKSHEET, {
<<<<<<< HEAD
            user: user,
            topic: topic,
            post: topic_post
=======
          user: user,
          topic: topic_title,
          post: topic_post
>>>>>>> 22b07270992b98f821f26e5c431d37146d73b8ba
        }, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve('New post added');
          }
        });
      }
    });
  });
}

/*
* Appends a user object to the spreadsheet
*
* @param {string} user - A username
* @param {string} pass - A password
* @param {string} account_type - Account type [admin, standard]
*/
var addNewUser = (user, pass, account_type) => {
  return new Promise((resolve, reject) => {
    doc.useServiceAccountAuth(creds, function(err) {
      if (err) {
        reject(err);
      } else {
        doc.addRow(USERS_WORKSHEET, {
          username: user,
          password: pass,
          user_type: account_type
        }, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve('New user added');
          }
        });
      }
    });
  });
}

/*
* Allows users to login using credentials saved in the databse
*
* @param {string} user - A username
* @param {string} pass - A password
*/
var login = (user, pass) => {
  return new Promise((resolve, reject) => {
    var login = {username: user, password: pass};
    doc.useServiceAccountAuth(creds, function(err) {
      if (err) {
        reject(err);
      } else {
        doc.getRows(USERS_WORKSHEET, function(err, rows) {
          if (err) {
            reject(err);
          } else {
            resolve(parseUserCreds(login, rows));
          }
        });
      }
    });
  });
};


/*
* Checks if the user credentials matches with the database.
*
* @param {object} login - Contains an object with user credentials
* @param {object} userList - Contains the data within the database
*/
var parseUserCreds = (login, userList) => {

  var return_statements = {
    success: "Authentication Successful",
    failed: "Authentication Failed"
  }

  for (var i=0; i<userList.length; i++) {
    if ((login.username === userList[i].username) && (login.password === userList[i].password)) {
      return return_statements.success;
      break;
    }
  }
  return return_statements.failed;
}

module.exports = {
  loadPosts,
  addNewPost,
  addNewUser,
  login
};
