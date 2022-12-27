import { LoadingButton } from "@mui/lab";
import { ButtonGroup } from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";


const Admin: NextPage = () => {
  const router = useRouter();
  const { secret } = router.query;

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const handleRefreshManual = useCallback(async () => {
    setIsManualRefreshing(true);
    await fetch("/api/refreshManual", {
      method: "POST"
    })
    setIsManualRefreshing(false);
  }, []);

  return (
    <div>
      運良く見つけた人へ - 別に押しても大丈夫だよ<br />
      <ButtonGroup variant="contained">
        <LoadingButton onClick={handleRefreshManual} loading={isManualRefreshing}>マニュアルを全て更新</LoadingButton>
      </ButtonGroup>
    </div>
  );
};

export default Admin;