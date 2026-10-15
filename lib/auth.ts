import "server-only";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 2 * 60 * 60 },
  providers: [GitHub({
    clientId: process.env.GITHUB_ID ?? process.env.AUTH_GITHUB_ID ?? "",
    clientSecret: process.env.GITHUB_SECRET ?? process.env.AUTH_GITHUB_SECRET ?? "",
  })],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "github") {
        token.githubId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.githubId === "string" && /^\d+$/.test(token.githubId)
          ? token.githubId : undefined;
      }
      return session;
    },
  },
};

export async function auth() {
  return getServerSession(authOptions);
}
