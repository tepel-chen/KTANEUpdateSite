import { AppBar as MuiAppBar, Box, Button, Toolbar } from "@mui/material"
import { Session } from "next-auth"
import Link from "next/link";
import { useCallback } from "react"
import { Usericon } from "./Usericon";


interface Props {
  session?: Session | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Appbar: React.FC<Props> = ({ session, onLogin, onLogout }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <MuiAppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Link href="/profile/changelog">
              <Button>プロファイル</Button>
            </Link>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            {((session && session.user) ? (
              <Usericon user={session.user} onLogout={onLogout} />
            ) : (
              <Button color="inherit" onClick={onLogin}>ログイン</Button>
            ))}
          </Box>
        </Toolbar>
      </MuiAppBar>
    </Box>
  )
}