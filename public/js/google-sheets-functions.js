// This is a database test for the forum

// Importing Google Spreadheet API
// https://www.npmjs.com/package/google-spreadsheet
const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('./json/client_secret.json'); // API Key

// Spreadsheet ID
const doc = new GoogleSpreadsheet('1cwmWMqAoqzYHhla1vpE_qiV5uQzRfuJ4HoPsfeH6LVk');

// Sheet Number
const USERS_WORKSHEET = 1;
const THREAD_WORKSHEET = 2; //removed and will use a parameter instead.

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
var loadPosts = (worksheet) => {
  return new Promise((resolve, reject) => {
    doc.useServiceAccountAuth(creds, function(err) {
      if (err) {
        reject(err);
      } else {
        doc.getRows(worksheet, function(err, rows) {
          if (err) {
            reject(err);
          } else if (worksheet == 2){
            var mdata = [];

            for (i=0; i < rows.length; i++) {
              var date1 = rows[i].initpostdate.split(' ');
              var date2 = rows[i].lastpostdate.split(' ')
              var temp = {thread_name: rows[i].threadname,
                          sheet_num: rows[i].sheetnum,
                          started_by: rows[i].startedby,
                          post_date: `${date1[1]} ${date1[2]}, ${date1[3]} ${date1[4]}`,
                          last_poster: rows[i].lastposter,
                          last_post_date: `${date2[1]} ${date2[2]}, ${date2[3]} ${date2[4]}`,
                          replies: rows[i].totalposts - 1,
                          viewed: rows[i].viewed,
                          topic_link: rows[i].link};

              mdata.push(temp);
            }
            resolve(mdata);
          } else if (worksheet > 2) {
            var mdata = [];

            for (i=0; i < rows.length; i++) {
              var date1 = rows[i].date.split(' ');
              var temp = {post_num: rows[i].postnum,
                          username: rows[i].username,
                          date: `${date1[1]} ${date1[2]}, ${date1[3]} ${date1[4]}`,
                          post: rows[i].post,
                          sheet_num: parseInt(worksheet)};

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
              sheet_num: thread_num,
              started_by: user,
              init_post_date: date,
              last_poster: user,
              last_post_date: date,
              total_posts: 1,
              viewed: 1,
              link: topic.replace(/ /g,"_").substring(0,14)
            }, function(err) {
              if (err) {
                reject(err);
              } else {
                resolve({
                  user: user,
                  thread_post: thread_post,
                  thread_num: thread_num,
                  link: topic.replace(/ /g,"_").substring(0,14)
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
                updateThreadList({
                  thread_num: thread_num,
                  last_user: user,
                  last_date: date,
                  num_posts: rows.length+1,
                  view_nums: 5
                });
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

// check for existence

var existcheck = (user) => {
  return new Promise((resolve, reject) => {
    var existcheck = {username: user};
    doc.useServiceAccountAuth(creds, function(err) {
      if (err) {
        reject(err);
      } else {
        doc.getRows(USERS_WORKSHEET, function(err, rows) {
          if (err) {
            reject(err);
          } else {
            resolve(checkFlag(existcheck, rows));
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
    success: "yes",
    failed: "no"
  }

  for (var i=0; i<userList.length; i++) {
    if ((login.username === userList[i].username) && (login.password === userList[i].password)) {
      return return_statements.success;
      break;
    }
  }
  return return_statements.failed;
}

var checkFlag = (login, userList) => {

  var return_statements = {
    success: "yes",
    failed: "no"
  }

  for (var i=0; i<userList.length; i++) {
    if (login.username === userList[i].username){
      return return_statements.success;
      break;
    }
  }
  return return_statements.failed;
}

var updateThreadList = (data) => {
  doc.useServiceAccountAuth(creds, function(err) {
    if (err) {
      reject(err);
    } else {
      doc.getInfo(function(err, info) {
        var sheet = info.worksheets[1];

        sheet.getCells({
          'min-row': data.thread_num-1,
          'max-row': data.thread_num-1
        }, function(err, cells) {
          cells[4].value = data.last_user;
          cells[5].value = data.last_date;
          cells[6].value = data.num_posts;
          cells[7].value = data.view_nums;
          sheet.bulkUpdateCells(cells);
        });
      }, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log('Info retrieved');
        }
      });
    }
  });
}

var updatePostView = (sheet) => {
  doc.useServiceAccountAuth(creds, function(err) {
    if(err) {
      reject(err);
    } else {
      doc.getRows(2, function(err, rows) {
        if (err) {
          reject(err);
        } else {
          for (var x in rows) {
            if (sheet == rows[x].sheetnum) {
              rows[x].viewed = parseInt(rows[x].viewed) + 1;
              rows[x].save();
            }
          }
        }
      })
    }
  })
}

module.exports = {
  loadPosts,
  addNewThread,
  addNewPost,
  addNewUser,
  login,
  existcheck,
  updatePostView
};
