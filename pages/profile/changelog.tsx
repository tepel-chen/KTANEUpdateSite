import type { GetServerSideProps, NextPage } from "next";
import { useCallback, useState } from "react";
import { useRouter } from "next/router";

import getMysql from "@Lib/mysql";
import Link from "next/link";


interface Change {
  moduleName: string;
  prevJaName: string;
  newJaName: string
}

export interface Props {
  changeLogs: {
    recordedAt: number;
    changes: Change[]
  }[]
}

export interface QueryResult {
  prevJaName: string,
  newJaName: string,
  recordedAt: number,
  moduleName: string,
  displayName?: string
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const mysql = await getMysql();

  const sql = `
    SELECT A.prevJaName, A.newJaName, recordedAt, moduleName, displayName 
      FROM ktane.moduleUpdate AS A 
      INNER JOIN ktane.moduleName as B 
      WHERE A.moduleID = B.moduleID;`;
  const res = ((await mysql.query(sql))[0] as QueryResult[]); 
  const map = new Map<number, Change[]>();
  for(const r of res) {
    if(!map.has(r.recordedAt)) {
      map.set(r.recordedAt, []);
    }
    const arr = map.get(r.recordedAt);
    if(!arr) throw new Error("Something went wrong...");
    arr.push({
      moduleName: r.displayName && r.displayName.length > 0 ? r.displayName : r.moduleName,
      prevJaName: r.prevJaName,
      newJaName: r.newJaName
    });
  }

  return {
    props: {
      changeLogs: Array.from(map.entries()).map(([recordedAt, changes]) => ({recordedAt, changes}))
    }
  };
};

const ChangeLog: NextPage<Props> = ({changeLogs}) => {

  const router = useRouter();

  const parsed = changeLogs.map(changeLog => ({
    ...changeLog,
    addStr: changeLog.changes.filter(change => change.prevJaName === "").map(change => `${change.newJaName}(${change.moduleName})`).join("、"),
    changeStr: changeLog.changes.filter(change => change.prevJaName !== "").map(change => `${change.prevJaName}→${change.newJaName}(${change.moduleName})`).join("、"),
  })).map(changeLog => ({
    ...changeLog,
    str: [changeLog.addStr.length > 0 ? `${changeLog.addStr}追加` : null, changeLog.changeStr.length > 0 ? changeLog.changeStr : null].join("\n")
  }));

  const [isReloading, setIsReloading] = useState(false);

  const handleCheckUpdate = useCallback(async () => {
    setIsReloading(true);
    await fetch("/api/checkForUpdate", {
      method: "POST"
    })
      .then(() => {
        router.reload();
      });
  }, [setIsReloading, router]);

  return (
    <div>
      <Link href="/api/profile"><a><button>プロファイルをダウンロード</button></a></Link>
      <button onClick={handleCheckUpdate} disabled={isReloading}>{isReloading ? "確認中" : "更新を確認"}</button><br />
      変更ログ
      <table>
        <thead>
          <tr>
            <th>日時</th><th>変更</th>
          </tr>
        </thead>
        <tbody>
          {parsed.map(changeLog => (
            <tr key={changeLog.recordedAt}>
              <td>{new Date(changeLog.recordedAt).toLocaleString()}</td>
              <td>{changeLog.str}</td>
            </tr>
          ))}
        </tbody>
      </table>
      過去のプロファイルと変更ログは<a href="https://tepel-chen.github.io/JaProfiles/">こちら</a>
    </div>
  );
};

export default ChangeLog;
