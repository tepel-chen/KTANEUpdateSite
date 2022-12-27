import mysql2 from "mysql2/promise";

export async function getMysql() {
  return await mysql2.createConnection({
    host     : process.env.ENDPOINT,
    database : process.env.DATABASE,
    user     : process.env.USERNAME,
    password : process.env.PASSWORD
  }
  );
}

export default getMysql;