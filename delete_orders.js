const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('backend/sportman_sandbox.db');
db.serialize(() => {
  db.run("DELETE FROM order_items WHERE order_id != 'SM-414549-VZ32'");
  db.run("DELETE FROM orders WHERE id != 'SM-414549-VZ32'");
  console.log('Deleted dummy orders');
});
