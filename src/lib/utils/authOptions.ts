import { env } from "@/lib/env";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail, findOrCreateUser } from "@/lib/db/api/user"
import { getUserPermissions, isAdministrator } from "@/lib/utils/permissions";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TODO: Replace with your user fetching logic
        if (credentials == null || credentials.email == null || credentials.email.length == 0) {
          return null;
        }
        const user = await getUserByEmail(credentials.email);
        if (user == null || user.password == null) {
          return null;
        }
        if (user && await bcrypt.compare(credentials.password, user.password)) {
          return { id: user.id, name: user.name, email: user.email, imageUrl: user.imageUrl };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({token, user}) {
      if (user && user.email) {
        const dbUser = await getUserByEmail(user.email);
        token.id = dbUser?.id;
        token.defaultRole = dbUser?.defaultRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.defaultRole = token.defaultRole as string;

        // Add permissions and admin status to session
        const userId = token.id as string;
        session.user.isAdmin = await isAdministrator(userId);
        session.user.permissions = await getUserPermissions(userId);

        // Fetch fresh user data to get latest name and imageUrl
        if (token.email) {
          const dbUser = await getUserByEmail(token.email as string);
          if (dbUser) {
            session.user.name = dbUser.name;
            session.user.image = dbUser.imageUrl;
          }
        }
      }
      return session;
    },
    async signIn({ user }) {
      if (user) {
        if (user.email == null || user.email.length == 0) {
          throw new Error('User doesn\'t have valid email');
        }
        await findOrCreateUser({ name: user.name || '', email: user.email, imageUrl: user.image || '', defaultRole: 'visitor' });
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