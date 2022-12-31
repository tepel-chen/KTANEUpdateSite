import { LoadingButton } from "@mui/lab";
import { ButtonGroup } from "@mui/material";
import { Appbar } from "components/Appbar";
import { GetServerSideProps, NextPage } from "next";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { useCallback, useState } from "react";


export const getServerSideProps: GetServerSideProps<Record<string, never>> = async (context) => {
  const session = await getSession(context);
  if (!session || session.user?.email !== "bhead1793@i.softbank.jp") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { }
  };
};


const Admin: NextPage = () => {

  const { data: session } = useSession();
  const handleLogin = useCallback(() => signIn(), []);
  const handleLogout = useCallback(() => signOut(), []);

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const handleRefreshManual = useCallback(async () => {
    setIsManualRefreshing(true);
    await fetch("/api/refreshManual", {
      method: "POST"
    });
    setIsManualRefreshing(false);
  }, []);

  return (
    <div>
      <Appbar session={session} onLogin={handleLogin} onLogout={handleLogout}/>
      運良く見つけた人へ - 別に押しても大丈夫だよ<br />
      <ButtonGroup variant="contained">
        <LoadingButton onClick={handleRefreshManual} loading={isManualRefreshing}>マニュアルを全て更新</LoadingButton>
      </ButtonGroup>
    </div>
  );
};

export default Admin;