import getMysql from "@Lib/mysql";

interface ToBeTranslated {
  moduleID: string;
  userID: string;
  jaName: string;
  remarks: string;
}

const sql = "INSERT INTO ktane.toBeTranslated SET ?";
export async function addToBeTranslated(tbt: ToBeTranslated) {
  const mysql = await getMysql();

  await mysql.query(sql, [{...tbt, translationStatus: tbt.userID ? "Assigned" : "Unassigned"}]);
}