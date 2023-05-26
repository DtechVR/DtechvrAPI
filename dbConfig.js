const mysql = require('mysql');
var con = mysql.createConnection({
    host: "mysql-44864-0.cloudclusters.net",
    port: "18178",
    user: "diyar",
    password: "2022Ashti2022",
    database: "dtechvr"
  });
con.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = con;