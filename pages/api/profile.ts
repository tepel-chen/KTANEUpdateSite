import checkForUpdates from "@Lib/checkForUpdates";
import getMysql from "@Lib/mysql";
import { lightFormat } from "date-fns";
import { RowDataPacket } from "mysql2";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method !== "GET") {
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
    return;
  }

  try {
    await checkForUpdates();

    const mysql = await getMysql();
    const enabledList: string[] = ((await mysql.query(`
      SELECT S.moduleID FROM module AS S
        INNER JOIN(SELECT moduleID, MAX(recordedAt) as r FROM module GROUP BY moduleID) T
        WHERE S.moduleID = T.moduleID AND S.recordedAt = T.r AND S.jaName <> "" AND 
          S.moduleID NOT IN (SELECT moduleID FROM exceptionModule);
    `))[0] as RowDataPacket[]).map(v => v["moduleID"]);
    const diabledList: string[] = ((await mysql.query(`
      SELECT S.moduleID FROM module AS S
        INNER JOIN(SELECT moduleID, MAX(recordedAt) as r FROM module GROUP BY moduleID) T
        WHERE S.moduleID = T.moduleID AND S.recordedAt = T.r AND (S.jaName = "" OR
          S.moduleID IN (SELECT moduleID FROM exceptionModule));
    `))[0]as RowDataPacket[]).map(v => v["moduleID"]);

    res.setHeader("Content-Disposition", `attachment; filename="Ja Profile v2.${lightFormat(new Date(), "yyMMddHH")}.json"`);

    res.status(200).json({
      DisabledList: diabledList,
      EnabledList: enabledList,
      Operation: 0
    });
  } catch (e) {
    res.status(500).json({ error: e });
  }
  
}