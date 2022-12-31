import { Appbar } from "components/Appbar";
import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCallback } from "react";

const Home: NextPage = () => {

  const {data: session} = useSession();
  const handleLogin = useCallback(() => signIn(), []);
  const handleLogout = useCallback(() => signOut(), []);

  return (
    <div>
      <Appbar session={session} onLogin={handleLogin} onLogout={handleLogout}/>
      🚧 工事中 🚧
    </div>
  );
};

export default Home;
