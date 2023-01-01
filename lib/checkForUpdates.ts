import getMysql from "@Lib/mysql";
import { QueryResult } from "pages/profile/changelog";


interface KtaneModule {
  ModuleID: string;
  Name: string;
  Sheets?: string[];
  Type: string;
  Origin: string;
  DisplayName?: string;
}

interface KtaneJSON {
  KtaneModules: KtaneModule[]
}

interface ParsedModInfo {
  moduleID: string;
  moduleName: string;
  displayName?: string;
  jaName?: string;
  manualUrl?: string;
}


const JSON_URL = "https://ktane.timwi.de/json/raw";
const reManual = new RegExp(/ translated \(日本語 — ([^)]+)\)( \([^)]+\))?(?=\|html\|)/);

export default async function checkForUpdates() {
  const data = await fetch(JSON_URL);
  const json: KtaneJSON = await data.json();
  const filtered = json.KtaneModules
    .filter(mod => mod.Origin !== "Vanilla" && ["Regular", "Needy"].includes(mod.Type) );

  const mysql = await getMysql();

  const parsedModInfo: ParsedModInfo[] = filtered.map(mod => {
    const match = mod.Sheets?.map(sheet => sheet.match(reManual)).find(m => m);
    return {
      moduleID: mod.ModuleID,
      moduleName: mod.Name,
      displayName: mod.DisplayName,
      jaName: match ? match[1] : undefined,
      manualUrl: match ? mod.Name + match[0] + ".html" : undefined
    };

  });


  const moduleNameSQL = "INSERT INTO ktane.moduleName (moduleID, moduleName, displayName, jaName, manualUrl) VALUES ?";
  const moduleNames = parsedModInfo.map(mod => {
    return [mod.moduleID, mod.moduleName, mod.displayName, mod.jaName, mod.manualUrl]; 
  });
  (async () => {
    await mysql.beginTransaction();
    await mysql.query("DELETE FROM ktane.moduleName;");
    await mysql.query(moduleNameSQL, [moduleNames]);
    await mysql.commit();
  })();
  
  const insertSQL = "INSERT IGNORE INTO ktane.module (moduleID, jaName, manualUrl, recordedAt) VALUES ?";
  const now = Date.now();
  const inserts = parsedModInfo.map(mod => [mod.moduleID, mod.jaName, mod.manualUrl, now]);
  await mysql.beginTransaction();
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

  const sendUpdateSQL = `
    SELECT A.prevJaName, A.newJaName, B.moduleName, B.displayName 
      FROM ktane.moduleUpdate AS A 
      INNER JOIN ktane.moduleName as B 
      WHERE A.moduleID = B.moduleID AND A.recordedAt = ?;`;
  
  const res = ((await mysql.query(sendUpdateSQL, now))[0] as QueryResult[]).map(r => ({
    moduleName: r.displayName && r.displayName.length > 0 ? r.displayName : r.moduleName,
    prevJaName: r.prevJaName,
    newJaName: r.newJaName
  }));
  const addStr = res.filter(r => r.prevJaName === "").map(r => `${r.newJaName}(${r.moduleName})`).join("、");
  const changeStr = res.filter(r => r.prevJaName !== "").map(r => `${r.prevJaName}→${r.newJaName}(${r.moduleName})`).join("、");

  if(addStr.length === 0 && changeStr.length === 0) return;
  try {
    await fetch(process.env.DISCORD_WEBHOOK_URL ?? "",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: addStr.length > 0 ? "新しい翻訳マニュアルが投稿されました!" : "モジュールの和名が変更されました。",
        embeds: [
          {
            title: "日本語対応モジュールプロファイル",
            url: `${process.env.URL}/profile/changelog`,
            fields: [
              {
                name: "追加",
                value: addStr
              },
              {
                name: "変更",
                value: changeStr
              },
              {
                name: "ご利用はこちらから",
                value:`[ダウンロード](${process.env.URL}/api/profile)`
              }
            ].filter(a => a.value.length > 0)
          },
        ],
      })
    });
  } catch (e) {
    console.log(e);
  }
}