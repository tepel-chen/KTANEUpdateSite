import getMysql from "@Lib/mysql";


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


const JSON_URL = "https://ktane.timwi.de/json/raw";
const reManual = new RegExp(/ translated \(日本語 — [^)]+\)( \([^)]+\))?/);
const updateSQL = `
UPDATE ktane.module 
	SET manualUrl = ?
	WHERE moduleID = ?;
`;

export default async function refreshManual() {
  const data = await fetch(JSON_URL);
  const json: KtaneJSON = await data.json();
  const filtered = json.KtaneModules
    .filter(mod => mod.Origin !== "Vanilla" && ["Regular", "Needy"].includes(mod.Type) );

  const mysql = await getMysql();

  await mysql.beginTransaction();
  for(const mod of filtered) {
    const match = mod.Sheets?.map(sheet => sheet.match(reManual)).find(m => m);
    if(!match) continue;
    await mysql.query(updateSQL, [mod.Name + match[0] + ".html", mod.ModuleID]);
  }
  await mysql.commit();
}