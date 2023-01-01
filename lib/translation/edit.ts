import getMysql from "@Lib/mysql";

interface ToBeTranslated {
  moduleID: string;
  userID: string;
  jaName: string;
  translationStatus: string;
  remarks: string;
}

const sql = "UPDATE ktane.toBeTranslated SET ? WHERE moduleID=?";
export async function editToBeTranslated(tbt: ToBeTranslated) {
  const mysql = await getMysql();

  await mysql.query(sql, [tbt, tbt.moduleID]);
}