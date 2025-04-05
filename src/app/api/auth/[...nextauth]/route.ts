import { env } from "@/lib/env";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    session({ session }) {
      return session;
    },
  },
  // events: {
  //   async signIn({ user }) {
  //     await mergeAnonymousCartIntoUserCart(user.id);
  //   },
  // },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
