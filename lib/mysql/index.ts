import mysql2 from "mysql2/promise";

export async function getMysql() {
  return await mysql2.createConnection({
    host     : process.env.ENDPOINT,
    database : process.env.DATABASE,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD
  }
  );
}

export default getMysql;