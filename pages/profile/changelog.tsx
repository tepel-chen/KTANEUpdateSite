import type { GetServerSideProps, NextPage } from "next";
import { useCallback, useState } from "react";
import { useRouter } from "next/router";

import getMysql from "@Lib/mysql";
import { Button, ButtonGroup, Container, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme } from "@mui/material";
import { LoadingButton } from "@mui/lab";


interface Change {
  moduleName: string;
  prevJaName: string;
  newJaName: string;
  manualUrl: string;
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
  displayName?: string,
  manualUrl: string,
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const mysql = await getMysql();

  const sql = `
    SELECT A.prevJaName, A.newJaName, A.recordedAt, moduleName, displayName, manualUrl
      FROM ktane.moduleUpdate AS A 
      INNER JOIN ktane.moduleName as B
      INNER JOIN (
        SELECT CA.moduleID, manualUrl
        FROM ktane.module AS CA
        INNER JOIN (
          SELECT moduleID, MAX(recordedAt) as maxRecordedAt
          FROM ktane.module 
          GROUP BY moduleID
        ) as CB WHERE CA.recordedAt = maxRecordedAt AND CA.moduleID = CB.moduleID
      ) as C
      WHERE A.moduleID = B.moduleID AND A.moduleID = C.moduleID;`;
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
      newJaName: r.newJaName,
      manualUrl: r.manualUrl
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
  const theme = useTheme();

  const parsed = changeLogs.map(changeLog => ({
    ...changeLog,
    addStr: changeLog.changes.filter(change => change.prevJaName === "").map(change => `${change.newJaName}(${change.moduleName})`).join("???"),
    changeStr: changeLog.changes.filter(change => change.prevJaName !== "").map(change => `${change.prevJaName}???${change.newJaName}(${change.moduleName})`).join("???"),
  })).map(changeLog => ({
    ...changeLog,
    str: [changeLog.addStr.length > 0 ? `${changeLog.addStr}??????` : null, changeLog.changeStr.length > 0 ? changeLog.changeStr : null].join("\n")
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

  const handleDownload = useCallback(() => {
    router.push("/api/profile");
  }, [router]);

  return (
    <Container sx={{marginTop: "32px"}} maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        ????????????????????????????????????????????????
      </Typography>
      <Typography paragraph>
        ??????????????????????????????????????????<Link href="https://tepel-chen.github.io/Tutorials/profile">??????????????????????????????</Link>????????????????????????
      </Typography>
      <ButtonGroup variant="contained">
        <Button onClick={handleDownload}>???????????????????????????????????????</Button>
        <LoadingButton variant="contained" onClick={handleCheckUpdate} loading={isReloading}>{isReloading ? "?????????" : "???????????????"}</LoadingButton><br />
      </ButtonGroup>
      <Typography paragraph>
        ?????????????????????????????????<strong>??????????????????</strong>????????????????????????????????????????????????????????????????????????????????????????????????
      </Typography>
      <Typography paragraph>
        ?????????????????????????????????????????????<Link href="https://tepel-chen.github.io/JaProfiles/">?????????</Link>
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        ????????????
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{textAlign: "center", fontWeight: "bold"}} component="th">??????</TableCell>
              <TableCell sx={{fontWeight: "bold"}} component="th">??????</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parsed.map(changeLog => (
              <TableRow key={changeLog.recordedAt}>
                <TableCell sx={{textAlign: "center"}}>{new Date(changeLog.recordedAt).toLocaleString()}</TableCell>
                <TableCell>
                  <div style={{display: "flex", flexWrap: "wrap"}}>
                    {changeLog.changes.map(c => {
                      const col = c.prevJaName.length === 0 ? theme.palette.primary : c.newJaName.length === 0 ? theme.palette.error : theme.palette.secondary;
                      return (
                        <div key={c.moduleName} style={{margin: "2px 8px"}}>
                          <span style={{
                            backgroundColor: col.main,
                            color: col.contrastText,
                            padding: "4px",
                            borderRadius: "12px",
                            fontSize: "10px",
                            marginRight: "4px"
                          }}>
                            {(c.prevJaName.length === 0 ? "??????" : c.newJaName.length === 0 ? "??????" : "????????????")}
                          </span>
                          <Link href={"https://ktane.timwi.de/HTML/" + c.manualUrl} target="_blank" rel="noopener noreferrer" >
                            {c.prevJaName}{c.newJaName.length > 0 &&  c.prevJaName.length > 0 ? "???" : ""}{c.newJaName}
                          </Link>
                          <span style={{color: theme.palette.text.secondary, fontSize: ".8em"}}>{c.moduleName}</span>
                        </div>
                      );})}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ChangeLog;
