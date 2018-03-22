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

/** Spreadsheet Notes **/
/*

  Google Spreadsheets objects are returned with the following format:

  OBJECT[ index / user number ] = {column_name: 'value in column'}

*/

// Loads data from the spreadsheet
// Returns an object containing the data from the spreadsheet
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

// TODO: Add posting feature

// Appends a user object to the spreadsheet
// @param {string} user
// @param {string} pass
// @param {string} account_type
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

// TODO: Add login feature


// Test Codes
// loadPosts().then((posts) => {
//   for (var i=0; i<posts.length; i++) {
//     console.log(posts[i].user);
//     console.log(posts[i].post);
//   }
// });
//
// addNewUser('coolguy6', 'testpass6', 'standard').then((result) => {
//   console.log(result);
// });

module.exports = {
  loadPosts,
  addNewUser
};
