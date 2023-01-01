import getMysql from "@Lib/mysql";
import { LoadingButton } from "@mui/lab";
import { Box, Checkbox, FormControlLabel, FormGroup, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import { Appbar } from "components/Appbar";
import type { GetServerSideProps, NextPage } from "next";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ChangeEventHandler, useCallback, useEffect, useMemo, useState } from "react";

interface Module {
  moduleID: string;
  moduleName: string;
  jaName?: string;
  translationStatus?: "Unassigned" | "Assigned" | "Translated" | "Submitted" | "Uploaded" | null;
  userID?: string;
  remarks: string;
}

interface Props {
  modules: Module[];
  tbt: Module;
}

const getModulesSQL = `
SELECT A.moduleID, moduleName, COALESCE(A.jaName, B.jaName) as jaName, translationStatus, userID, remarks FROM ktane.moduleName AS A
  LEFT OUTER JOIN ktane.toBeTranslated AS B ON A.moduleID = B.moduleID;
`;

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const session = await getSession(context);
  const mysql = await getMysql();
  const modules = ((await mysql.query(getModulesSQL))[0] as Module[])
    .map(m => ({
      ...m,
      translationStatus: m.translationStatus ?? (m.jaName ? "Uploaded" : null)
    }));
  const tbt = modules.find(mod => mod.moduleID === context.query.moduleID);
  if(!tbt || tbt.userID !== session?.user?.id) return {
    redirect: {
      destination: "/translation/list",
      permanent: false,
    }
  };
  return {
    props: { modules, tbt }
  };
};


const EditTranslation: NextPage<Props> = ({ modules, tbt }) => {

  const { data: session } = useSession();
  const router = useRouter();
  const { moduleID } = router.query;
  const handleLogin = useCallback(() => signIn(), []);
  const handleLogout = useCallback(() => signOut(), []);

  const [translatedStr, setTranslatedStr] = useState(tbt.jaName ?? "");
  const [assignCheck, setAssignCheck] = useState(false);
  const [remarks, setRemarks] = useState(tbt.remarks);
  const [translationStatus, setTranslationStatus] = useState<string | undefined>(tbt.translationStatus ?? undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    setAssignCheck(tbt.userID === session?.user?.id);
  }, [session?.user?.id, tbt.userID]);

  const handleTranslatedChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setTranslatedStr(e.target.value);
  }, [setTranslatedStr]);
  const handleAssignCheck = useCallback((_: unknown, checked: boolean) => {
    setAssignCheck(checked);
    if(checked && translationStatus === "Unassigned") setTranslationStatus("Assigned");
    if(!checked && translationStatus !== "Unassigned") setTranslationStatus("Unassigned");
  }, [setAssignCheck, setTranslationStatus, translationStatus]);
  const handleRemarksChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setRemarks(e.target.value);
  }, [setRemarks]);
  const handleStatusChange = useCallback((e: SelectChangeEvent<string>) => {
    setTranslationStatus(e.target.value);
    if(e.target.value !== "Unassigned" && !assignCheck) setAssignCheck(true);
    if(e.target.value === "Unassigned" && assignCheck) setAssignCheck(false);

  }, [setTranslationStatus, assignCheck]);
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    await fetch(`/api/translation/edit`, {
      method: "POST",
      body: JSON.stringify({
        moduleID,
        userID: assignCheck ? (session?.user?.id ?? null) : null,
        jaName: translatedStr,
        translationStatus,
        remarks
      })
    });
    router.push("/translation/list");
  }, [setIsSubmitting, assignCheck, session?.user?.id, translatedStr, remarks, router, moduleID, translationStatus]);


  const translationError = useMemo(() => {
    if(translatedStr.length > 255) return "255文字以下にしてください。";
    const dup = modules.find(mod => mod.jaName?.trim() === translatedStr.trim() && mod.moduleID !== moduleID);
    if(dup) return `既に使われています。(${dup.moduleName})`;
    return null;
  }, [translatedStr, modules, moduleID]);
  const canBeSubmitted = useMemo(() => {
    if(typeof translationError === "string") return false;
    return true;
  }, [translationError]);

  return (
    <div>
      <Appbar session={session} onLogin={handleLogin} onLogout={handleLogout} />
      <Box>
        <TextField
          label="和名"
          variant="standard"
          value={translatedStr}
          onChange={handleTranslatedChange}
          error={typeof translationError === "string"}
          helperText={translationError}
        />
        <FormGroup>
          <FormControlLabel control={<Checkbox onChange={handleAssignCheck} checked={assignCheck} disabled={!session?.user?.id} />} label="自分に割り当てる" />
        </FormGroup>
        <TextField label="備考" variant="standard" fullWidth onChange={handleRemarksChange} value={remarks} />
        <Select label="状態" onChange={handleStatusChange} value={translationStatus}>
          <MenuItem value="Unassigned">未割当</MenuItem>
          <MenuItem value="Assigned">割当済み</MenuItem>
          <MenuItem value="Translated">翻訳済み</MenuItem>
          <MenuItem value="Submitted">提出済み</MenuItem>
        </Select>
        <Box sx={{ mt: 1 }}>
          <LoadingButton variant="contained" disabled={!canBeSubmitted} loading={isSubmitting} onClick={handleSubmit}>更新</LoadingButton>
        </Box>
      </Box>
    </div>
  );
};

export default EditTranslation;
