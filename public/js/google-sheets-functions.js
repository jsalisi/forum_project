// This is a database test for the forum

const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('./json/client_secret.json');

const doc = new GoogleSpreadsheet('1cwmWMqAoqzYHhla1vpE_qiV5uQzRfuJ4HoPsfeH6LVk');

// Spredsheet ID
const USERS_WORKSHEET = 1;
const GD_WORKSHEET = 2;

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
