import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_OAUTH_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_OAUTH_CLIENT_SECRET ?? ""
    }),
  ]

};

export default NextAuth(authOptions);