import { env } from "@/lib/env";
import { NextAuthOptions } from "next-auth";
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
      if (user && user.email) {
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
      if (user) {
        if (user.email == null || user.email.length == 0) {
          throw new Error('User doesn\'t have valid email');
        }
        await findOrCreateUser({ name: user.name || '', email: user.email, imageUrl: user.image || ''});
        return true;
      }
      return false;
    }
  },
  secret: env.SECRET
  // events: {
  //   async signIn({ user }) {
  //     await mergeAnonymousCartIntoUserCart(user.id);
  //   },
  // },
};