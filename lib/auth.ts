import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {

  providers: [
    CredentialsProvider({

      name: "credentials",

      credentials: {
        email: {
          label: "Email",
          type: "text",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },


      async authorize(credentials) {

        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          return null;
        }


        const user =
          await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });


        if (!user || !user.password) {
          return null;
        }


        const isValid =
          await bcrypt.compare(
            credentials.password,
            user.password
          );


        if (!isValid) {
          return null;
        }


        return {
          id: user.id,
          email: user.email,
          role: user.role,
          schoolId: user.schoolId,
          subscriptionStatus:
            user.subscriptionStatus,
        };
      },
    }),
  ],


  session: {
    strategy: "jwt",
  },


  callbacks: {


    async jwt({ token, user }) {


      if (user) {

        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.schoolId = user.schoolId;

        token.subscriptionStatus =
          user.subscriptionStatus;
      }


      if (token.email) {


        const dbUser =
          await prisma.user.findUnique({

            where: {
              email: token.email,
            },

          });


        if (dbUser) {

          token.subscriptionStatus =
            dbUser.subscriptionStatus;


          token.schoolId =
            dbUser.schoolId;


          token.role =
            dbUser.role;
        }
      }


      return token;
    },



    async session({ session, token }) {


      session.user.id =
        token.id;


      session.user.email =
        token.email;


      session.user.role =
        token.role;


      session.user.schoolId =
        token.schoolId;


      session.user.subscriptionStatus =
        token.subscriptionStatus;


      return session;
    },

  },


  pages: {
    signIn: "/login",
  },

};