import getMysql from "@Lib/mysql";


interface KtaneModule {
  ModuleID: string,
  Name: string,
  Sheets?: string[]
}

interface KtaneJSON {
  KtaneModules: KtaneModule[]
}


const JSON_URL = "https://ktane.timwi.de/json/raw";

export default async function checkForUpdates() {
  const data = await fetch(JSON_URL);
  const json: KtaneJSON = await data.json();

  const mysql = await getMysql();
  const insertSQL = "INSERT IGNORE INTO ktane.module (moduleID, jaName, recordedAt) VALUES ? ";
  const now = Date.now();
  const inserts = json.KtaneModules.map(mod => {
    const match = mod.Sheets?.find(sheet => sheet.includes("日本語"))?.match(/\(日本語 — ([^)]+)\)/);
    return [mod.ModuleID, match && match.length > 1 ? match[1] : "", now];
  });
  await mysql.query(insertSQL, [inserts]);

  const updateSQL = `
    INSERT INTO moduleUpdate (moduleID, prevJaName, newJaName, recordedAt)
    SELECT module.moduleID, S.jaName, module.jaName, module.recordedAt
    FROM module
    INNER JOIN (SELECT module.moduleID, module.jaName
      FROM module
      INNER JOIN (SELECT module.moduleID, MAX(module.recordedAt) AS r
        FROM module 
        WHERE recordedAt <> ? 
        GROUP BY module.moduleID) T
      WHERE T.moduleID = module.moduleID AND T.r = module.recordedAt) S
    WHERE module.recordedAt = ? AND S.moduleID = module.moduleID;
  `;
  await mysql.query(updateSQL, [now, now]);

  await mysql.commit();

}