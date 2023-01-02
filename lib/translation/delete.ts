import getMysql from "@Lib/mysql";

const sql = "DELETE FROM ktane.toBeTranslated WHERE moduleID=?";
export async function deleteToBeTranslated(id: string) {
  const mysql = await getMysql();

  await mysql.query(sql, [id]);
}