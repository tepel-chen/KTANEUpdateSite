import getMysql from "@Lib/mysql";
import { ResultSetHeader } from "mysql2";
import { Adapter, AdapterSession, AdapterUser, VerificationToken } from "next-auth/adapters";

export default function MySQLAdapter(): Adapter {

  return {
    async createUser(user) {
      const mysql = await getMysql();
      const sql = "INSERT INTO auth.user SET ?";
      const res = (await mysql.query(sql, [user]))[0] as ResultSetHeader;
      return {...user, id: res.insertId.toString()};
    },
    async getUser(id) {
      const mysql = await getMysql();
      const sql = "SELECT name, email, emailVerified, image FROM auth.user WHERE id=?;";
      const res = (await mysql.query(sql, [id]))[0] as AdapterUser[];
      return res[0];
    },
    async getUserByEmail(email) {
      const mysql = await getMysql();
      const sql = "SELECT name, email, emailVerified, image FROM auth.user WHERE email=?;";
      const res = (await mysql.query(sql, [email]))[0] as AdapterUser[];
      return res[0];
    },
    async getUserByAccount({ provider, providerAccountId }) {
      const mysql = await getMysql();
      const sql = `
      SELECT usr.id,usr.name,usr.email,usr.emailVerified,usr.image FROM auth.account AS acc
        INNER JOIN auth.user AS usr
        WHERE acc.userId=usr.id AND acc.provider=? AND acc.providerAccountId=?;
      `;
      const res = (await mysql.query(sql, [provider, providerAccountId]))[0] as AdapterUser[];
      return res[0];
    },
    async updateUser(user) {
      const mysql = await getMysql();
      mysql.beginTransaction();
      const updateSQL = "UPDATE auth.user SET ? WHERE id=?";
      await mysql.query(updateSQL, [user, user.id]);
      const selectSQL = "SELECT name, email, emailVerified, image FROM auth.user WHERE id=?;";
      const res = (await mysql.query(selectSQL, [user.id]))[0] as AdapterUser[];
      mysql.commit();
      return res[0];
    },
    async linkAccount(account) {
      const mysql = await getMysql();
      const sql = "INSERT INTO auth.account SET ?";
      const res = (await mysql.query(sql, [account]))[0] as ResultSetHeader;
      return {...account, id: res.insertId};
    },
    async createSession({ sessionToken, userId, expires }) {
      const mysql = await getMysql();
      const session = {
        expires,
        sessionToken,
        userId
      };
      const sql = "INSERT INTO auth.session SET ?";
      await mysql.query(sql, [session]);
      return session;
    },
    async getSessionAndUser(sessionToken) {
      const mysql = await getMysql();
      const sql = `
      SELECT usr.id,usr.name,usr.email,usr.emailVerified,usr.image,s.expires FROM auth.session AS s
        INNER JOIN auth.user AS usr
        WHERE s.userId=usr.id AND s.sessionToken=?;
      `;

      const res = (await mysql.query(sql, [sessionToken]))[0];
      if((res as never[]).length === 0) return null;
      const {id, name, email, emailVerified, image} = (res as AdapterUser[])[0];
      const {expires} = (res as AdapterSession[])[0];
      return {
        user: {id, name, email, emailVerified, image},
        session: {
          expires,
          sessionToken,
          userId: id,
        }
      };
    },
    async updateSession(session) {
      const mysql = await getMysql();

      mysql.beginTransaction();
      const updateSQL = "UPDATE auth.session SET ? WHERE sessionToken=?";
      await mysql.query(updateSQL, [session, session.sessionToken]);
      const selectSQL = "SELECT * FROM auth.session WHERE sessionToken=?;";
      const res = (await mysql.query(selectSQL, [session.sessionToken]))[0] as AdapterSession[];
      mysql.commit();
      return res[0];
    },
    async deleteSession(sessionToken) {
      const mysql = await getMysql();
      const sql = "DELETE FROM auth.session WHERE sessionToken=?";
      await mysql.query(sql, [sessionToken]);
      return;
    },
    async createVerificationToken(verificationToken) {
      const mysql = await getMysql();
      const sql = "INSERT INTO auth.verificationToken SET ?";
      await mysql.query(sql, [verificationToken]);
      return verificationToken;
    },
    async useVerificationToken({ identifier, token }) {
      const mysql = await getMysql();
      const sql = "SELECT identifier,token,expires FROM auth.verificationToken WHERE identifier=? AND token=?";
      const res = (await mysql.query(sql, [identifier, token]))[0] as VerificationToken[];
      return res[0];
    },
  };
}