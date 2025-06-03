// config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',   
  port: 3306,          
  user: 'root',      
  password: '23144',    
  database: 'banco_malvezi', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
