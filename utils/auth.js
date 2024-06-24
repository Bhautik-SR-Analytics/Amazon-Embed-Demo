import { getServerSession } from "next-auth";
import { getUserFromDb } from "@/serveractions/actions";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@/utils/password";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { type: "text" },
        password: { type: "password" },
      },
      async authorize(credentials, req) {
        try {
          let user = null;
          let username = credentials?.username;
          let password = credentials?.password;
          // logic to salt and hash password
          user = await getUserFromDb(username);

          if (!user) {
            throw new Error("User not found, please check your username.");
          }

          const matchPass = await verifyPassword(password, user.password);

          if (matchPass) {
            // return user object with the their profile data
            return user;
          } else {
            throw new Error("Please check your password.");
          }
        } catch (error) {
          console.log(error);
          throw new Error("Please check your username and password.");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login/",
    error: "/login/",
    signOut: "/",
  },
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      let userData = user;
      if (userData) {
        token.user_id = userData.user_id;
        token.name = userData.username;
        token.user_role = userData.user_role;
        token.client_id = userData.client_id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session) {
        session.user.id = token?.user_id;
        session.user.name = token?.name;
        session.user.userRole = token?.user_role;
        session.user.client_id = token?.client_id;
      }
      return session;
    },
  },
  events: {
    async signOut(token, session) {},
  },
};

export async function auth(...args) {
  const session = await getServerSession(...args, authOptions);
  return session ? session?.user : null;
}

export default authOptions;
