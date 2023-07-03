const mysql = require('mysql');
var con = mysql.createConnection({
    host: "admiring-snyder.51-159-29-254.plesk.page",
    port: "3306",
    user: "dtech",
    password: "1998diyarmms",
    database: "dtechvr"
  });
con.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = con;
