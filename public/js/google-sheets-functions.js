// This is a database test for the forum

const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('./client_secret.json');

const doc = new GoogleSpreadsheet('1cwmWMqAoqzYHhla1vpE_qiV5uQzRfuJ4HoPsfeH6LVk');

// Spredsheet ID
const users_worksheet = 1;
const posts_worksheet = 2;

var loadPosts = () => {
  return new Promise((resolve, reject) => {
    doc.useServiceAccountAuth(creds, function(err) {
      if (err) {
        reject(err);
      } else {
        doc.getRows(posts_worksheet, function(err, rows) {
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
        doc.addRow(users_worksheet, {
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
// addNewUser('coolguy5', 'testpass5', 'standard').then((result) => {
//   console.log(result);
// });

module.exports = {
  loadPosts,
  addNewUser
}
