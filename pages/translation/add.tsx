import getMysql from "@Lib/mysql";
import { LoadingButton } from "@mui/lab";
import { Box, Checkbox, FormControlLabel, FormGroup, Grid, TextField, Typography } from "@mui/material";
import { Appbar } from "components/Appbar";
import type { GetServerSideProps, NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { ChangeEventHandler, useCallback, useMemo, useState } from "react";

interface Module {
  moduleID: string;
  moduleName: string;
  jaName?: string;
  translationStatus?: "Unassigned" | "Assigned" | "Translated" | "Submitted" | "Uploaded" | null;
}

interface Props {
  modules: Module[];
}

const getModulesSQL = `
SELECT A.moduleID, moduleName, COALESCE(A.jaName, B.jaName) as jaName, translationStatus FROM ktane.moduleName AS A
  LEFT OUTER JOIN ktane.toBeTranslated AS B ON A.moduleID = B.moduleID;
`;

function mapStatus(status?: string | null) {
  if (status === "Unassigned") return "コメントあり";
  if (status === "Assigned") return "割当済み";
  if (status === "Translated") return "翻訳済";
  if (status === "Submitted") return "提出済";
  if (status === "Uploaded") return "アップロード済";
  return "未割当";
}

const ModuleDisplay: React.FC<{ module: Module, onSelect: (module: Module) => void }> = ({ module, onSelect }) => {

  const handleSelect = useCallback(() => {
    onSelect(module);
  }, [module, onSelect]);

  return (
    <Box sx={{
      p: 1,
      m: 1,
      cursor: "pointer",
      display: "inline-block",
      bgcolor: module.translationStatus ? "grey.800" : "primary.main",
      "&:hover": {
        bgcolor: module.translationStatus ? "grey.700" : "primary.dark",
      },
      color: module.translationStatus ? "inherit" : "primary.contrastText",
    }}
    onClick={handleSelect}
    >
      {module.moduleName}
      <Typography sx={{
        display: "inline",
        pl: 1,
        fontSize: ".8em"
      }}>{mapStatus(module.translationStatus)}</Typography> <br />
      <Typography sx={{
        display: "inline",
        fontSize: ".8em"
      }}>{module.moduleID}</Typography>
    </Box>
  );
};


export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const mysql = await getMysql();
  const modules = ((await mysql.query(getModulesSQL))[0] as Module[])
    .map(m => ({
      ...m,
      translationStatus: m.translationStatus ?? (m.jaName ? "Uploaded" : null)
    }));
  return {
    props: { modules }
  };
};


const TranslationAdd: NextPage<Props> = ({ modules }) => {

  const { data: session } = useSession();
  const router = useRouter();
  const handleLogin = useCallback(() => signIn(), []);
  const handleLogout = useCallback(() => signOut(), []);

  const [searchStr, setSearchStr] = useState("");
  const [selectedID, setSelectedID] = useState<string | null>(null);
  const [translatedStr, setTranslatedStr] = useState("");
  const [assignCheck, setAssignCheck] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    setAssignCheck(!!session?.user?.id);
  }, [session?.user?.id]);

  const handleSearchChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setSearchStr(e.target.value);
    setSelectedID(null);
  }, [setSearchStr, setSelectedID]);
  const handleSelectModule = useCallback((module: Module) => {
    setSearchStr(module.moduleName);
    setSelectedID(module.moduleID);
  }, [setSearchStr, setSelectedID]);
  const handleTranslatedChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setTranslatedStr(e.target.value);
  }, [setTranslatedStr]);
  const handleAssignCheck = useCallback((_: unknown, checked: boolean) => {
    setAssignCheck(checked);
  }, [setAssignCheck]);
  const handleRemarksChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setRemarks(e.target.value);
  }, [setRemarks]);
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    await fetch("/api/translation/add", {
      method: "POST",
      body: JSON.stringify({
        moduleID: selectedID,
        userID: assignCheck ? (session?.user?.id ?? null) : null,
        jaName: translatedStr,
        remarks
      })
    });
    router.push("/translation/list");
  }, [setIsSubmitting, selectedID, assignCheck, session?.user?.id, translatedStr, remarks, router]);

  const translationError = useMemo(() => {
    if(translatedStr.length > 255) return "255文字以下にしてください。";
    const dup = modules.find(mod => mod.jaName?.trim() === translatedStr.trim());
    if(dup) return `既に使われています。(${dup.moduleName})`;
    return null;
  }, [translatedStr, modules]);
  const canBeSubmitted = useMemo(() => {
    if(typeof translationError === "string") return false;
    if(typeof selectedID !== "string") return false;
    return true;
  }, [translationError, selectedID]);


  const filteredModules = useMemo(() => {
    if (searchStr === "") {
      return modules.filter(mod => !mod.translationStatus).slice(0,20);
    }
    const lst =  modules
      .filter(mod => mod.moduleName.toLocaleLowerCase().includes(searchStr.toLocaleLowerCase()) || mod.moduleID.toLocaleLowerCase().includes(searchStr.toLocaleLowerCase()));

    lst.sort((a, b) => {
      if (a.translationStatus && !b.translationStatus) return 1;
      if (b.translationStatus && !a.translationStatus) return -1;
      return a.moduleName.localeCompare(b.moduleName);
    });
    return lst.slice(0,20);

  }, [modules, searchStr]);
  return (
    <div>
      <Appbar session={session} onLogin={handleLogin} onLogout={handleLogout} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box sx={{ "& > :not(style)": { mr: 1, mt: 1} }}>
            <TextField 
              label="モジュール(英名)" 
              variant="standard" 
              value={searchStr}
              onChange={handleSearchChange}
            />
            <TextField 
              label="和名" 
              variant="standard" 
              value={translatedStr} 
              onChange={handleTranslatedChange} 
              error={typeof translationError === "string"}
              helperText={translationError}
            />
          </Box>
          <FormGroup>
            <FormControlLabel control={<Checkbox onChange={handleAssignCheck} checked={assignCheck} disabled={!session?.user?.id}/>} label="自分に割り当てる" />
          </FormGroup>
          <TextField label="備考" variant="standard" fullWidth onChange={handleRemarksChange} value={remarks} />
          <Box sx={{mt: 1}}>
            <LoadingButton variant="contained" disabled={!canBeSubmitted} loading={isSubmitting} onClick={handleSubmit}>送信</LoadingButton>
          </Box>
        </Grid>
        <Grid item xs={6}>
          {filteredModules.map(mod => (
            <ModuleDisplay key={mod.moduleID} module={mod} onSelect={handleSelectModule} />
          ))}
        </Grid>
      </Grid>
    </div>
  );
};

export default TranslationAdd;
