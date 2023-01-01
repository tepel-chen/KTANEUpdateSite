import getMysql from "@Lib/mysql";
import { Appbar } from "components/Appbar";
import type { GetServerSideProps, NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Link } from "@mui/material";


interface Module {
  id: string;
  moduleName: string;
  jaName?: string;
  user?: string;
  translationStatus?: "Unassigned" | "Assigned" | "Translated" | "Submitted" | "Uploaded" | null;
  remarks: string;
}

interface Props {
  modules: Module[];
}

function mapStatus(status?: string | null) {
  if (status === "Unassigned") return "コメントあり";
  if (status === "Assigned") return "割当済み";
  if (status === "Translated") return "翻訳済";
  if (status === "Submitted") return "提出済";
  if (status === "Uploaded") return "アップロード済";
  return "未割当";
}


const getModulesSQL = `
SELECT A.moduleID AS id,B.moduleName, A.jaName, A.translationStatus, A.remarks, D.name as user
  FROM ktane.toBeTranslated AS A
  INNER JOIN ktane.moduleName AS B ON A.moduleID=B.moduleID
  INNER JOIN auth.account AS C ON A.userID=C.providerAccountId
  INNER JOIN auth.user AS D ON C.userId=D.id; 
`;

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const mysql = await getMysql();
  const modules = ((await mysql.query(getModulesSQL))[0] as Module[]);
  return {
    props: { modules }
  };
};


const columns: GridColDef<Module, string, Module>[] = [
  { field: "moduleName", headerName: "モジュール名", flex: 1 },
  { field: "jaName", headerName: "和名", flex: 1 },
  { field: "user", headerName: "ユーザー名", flex: 1 },
  { 
    field: "translationStatus", 
    headerName: "状態", 
    flex: 1, 
    valueGetter: (params) => mapStatus(params.row.translationStatus)
  },
  { field: "remarks", headerName: "備考", flex: 4 },
  {
    field: "edit", 
    headerName: "",
    sortable: false,
    width: 90,
    renderCell: (params) => <Link href={`/translation/edit/${params.row.id}`}><Button variant="contained" color="primary">編集</Button></Link>
  }
];

const TranslationList: NextPage<Props> = ({modules}) => {

  const {data: session} = useSession();
  const handleLogin = useCallback(() => signIn(), []);
  const handleLogout = useCallback(() => signOut(), []);

  const [filter, setFilter] = useState(false);

  const filteredModules = useMemo(() => {
    if(!filter) return modules;
    console.log(modules, session?.user?.name)
    return modules.filter(mod => mod.user === session?.user?.name);
  }, [modules, filter])

  useEffect(() => {
    setFilter(!!session?.user?.id)
  },[session?.user?.id]);

  const handleChangeFilter = useCallback((_: unknown, checked: boolean) => {
    setFilter(checked);
  }, [setFilter]);

  return (
    <div>
      <Appbar session={session} onLogin={handleLogin} onLogout={handleLogout}/>
      <Box
      >
      <FormGroup>
        <FormControlLabel control={<Checkbox onChange={handleChangeFilter} checked={filter} disabled={!session?.user?.id} />} label="自分の割り当てのみ" />
      </FormGroup>
        <DataGrid 
          rows={filteredModules}
          columns={columns}
          autoHeight
          disableSelectionOnClick
        />
        
      </Box>
    </div>
  );
};

export default TranslationList;
