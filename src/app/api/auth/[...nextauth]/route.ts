import { env } from "@/lib/env";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserByEmail, findOrCreateUser } from "@/lib/db/api/user"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({token, user}) {
      if (user) {
        const dbUser = await getUserByEmail(user.email);
        token.id = dbUser?.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user }) {
      await findOrCreateUser(user);
      return true;
    }
  },
  // events: {
  //   async signIn({ user }) {
  //     await mergeAnonymousCartIntoUserCart(user.id);
  //   },
  // },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
