// This is a database test for the forum

// Importing Google Spreadheet API
// https://www.npmjs.com/package/google-spreadsheet
const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('./json/client_secret.json'); // API Key

// Spreadsheet ID
const doc = new GoogleSpreadsheet('1cwmWMqAoqzYHhla1vpE_qiV5uQzRfuJ4HoPsfeH6LVk');

// Sheet Number
const USERS_WORKSHEET = 1;
const THREAD_WORKSHEET = 2;

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
        doc.getRows(THREAD_WORKSHEET, function(err, rows) {
          if (err) {
            reject(err);
          } else {
            var mdata = [];

            for (i=0; i < rows.length; i++) {
              var temp = {thread_name: rows[i].threadname,
                          sheet_num: rows[i].sheetnum,
                          started_by: rows[i].startedby,
                          post_date: rows[i].initpostdate,
                          last_poster: rows[i].lastposter,
                          last_post_date: rows[i].lastpostdate,
                          total_posts: rows[i].totalposts,
                          topic_link: rows[i].link};

              mdata.push(temp);
            }
            resolve(mdata);
          }
        });
      }
    });
  });
}

/*
* Appends a thread as a worksheet to the spreadsheet
*
* @param {string} user - A username
* @param {string} topic - A title for the post
* @param {string} thread_post - Initial thread post
*/
var addNewThread = (user, topic, thread_post, date) => {
  return new Promise((resolve, reject) => {
    doc.useServiceAccountAuth(creds, function(err) {
      if (err) {
        reject(err);
      } else {
        doc.addWorksheet({
            title: topic
        }, function(err, sheet) {
          if (err) {
            reject(err);
          } else {
            sheet.setHeaderRow(['post_num', 'username', 'date', 'post'])
          }
        });
        doc.getRows(THREAD_WORKSHEET, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            thread_num = rows.length + 3;
            doc.addRow(THREAD_WORKSHEET, {
              thread_name: topic,
              started_by: user,
              sheet_num: thread_num,
              init_post_date: date,
              link: topic.replace(/ /g,"_")
            }, function(err) {
              if (err) {
                reject(err);
              } else {
                resolve({
                  user: user,
                  thread_post: thread_post,
                  thread_num: thread_num
                });
              }
            });
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
* @param {string} date - Date post was created
* @param {string} thread_post - A new thread created by the user
* @param {string} thread_num - The thread id number represented as a string
*/
var addNewPost = (user, date, thread_post, thread_num) => {
  return new Promise((resolve, reject) => {
    doc.useServiceAccountAuth(creds, function(err) {
      if (err) {
        reject(err);
      } else {
        doc.getRows(thread_num, (err,rows) => {
          if (err) {
            console.log(err);
          } else {
            doc.addRow(thread_num, {
                post_num: rows.length + 1,
                username: user,
                date: date,
                post: thread_post
            }, function(err) {
              if (err) {
                reject(err);
              } else {
                resolve('New post added');
              }
            });
          }
        })
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
  addNewThread,
  addNewPost,
  addNewUser,
  login
};
