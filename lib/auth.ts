import { type NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
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


        const school = user.schoolId
          ? await prisma.school.findUnique({
              where: { id: user.schoolId },
              include: { subscription: true },
            })
          : null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          schoolId: user.schoolId,
          subscriptionStatus:
            school?.subscription?.status ?? "TRIAL",
          passwordChangedAt: user.passwordChangedAt,
          emailChangedAt: user.emailChangedAt,
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
        token.name = user.name;
        token.role = user.role;
        token.schoolId = user.schoolId;

        token.subscriptionStatus =
          user.subscriptionStatus;
        token.passwordChangedAt = user.passwordChangedAt;
        token.emailChangedAt = user.emailChangedAt;
      }


      if (token.email) {


        const dbUser =
          await prisma.user.findUnique({

            where: {
              email: token.email,
            },

          });


        if (dbUser) {

          if (dbUser.passwordChangedAt) {
            const tokenPasswordChangedAt = token.passwordChangedAt
              ? new Date(token.passwordChangedAt)
              : null;

            if (
              !tokenPasswordChangedAt ||
              dbUser.passwordChangedAt > tokenPasswordChangedAt
            ) {
              return { ...token, id: "", email: "" } as JWT;
            }
          }

          if (dbUser.emailChangedAt) {
            const tokenEmailChangedAt = token.emailChangedAt
              ? new Date(token.emailChangedAt)
              : null;

            if (
              !tokenEmailChangedAt ||
              dbUser.emailChangedAt > tokenEmailChangedAt
            ) {
              return { ...token, id: "", email: "" } as JWT;
            }
          }

          if (dbUser.schoolId) {
            const school =
              await prisma.school.findUnique({
                where: { id: dbUser.schoolId },
                include: {
                  subscription: true,
                },
              });

            token.subscriptionStatus =
              school?.subscription?.status ?? "TRIAL";
          } else {
            token.subscriptionStatus = "TRIAL";
          }

          token.schoolId =
            dbUser.schoolId;

          token.name =
            dbUser.name;

          token.role =
            dbUser.role;

          token.passwordChangedAt = dbUser.passwordChangedAt;
          token.emailChangedAt = dbUser.emailChangedAt;
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

      session.user.name =
        token.name;

      session.user.subscriptionStatus =
        token.subscriptionStatus;

      session.user.passwordChangedAt =
        token.passwordChangedAt;

      session.user.emailChangedAt =
        token.emailChangedAt;


      return session;
    },

  },


  pages: {
    signIn: "/login",
  },

};
