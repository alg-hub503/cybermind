import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      schoolId: string | null;
      subscriptionStatus: string;
      name?: string | null;
      image?: string | null;
      passwordChangedAt?: Date | null;
      emailChangedAt?: Date | null;
    };
  }

  interface User {
    id: string;
    email: string;
    role: string;
    schoolId: string | null;
    subscriptionStatus: string;
    passwordChangedAt?: Date | null;
    emailChangedAt?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: string;
    schoolId: string | null;
    subscriptionStatus: string;
    passwordChangedAt?: Date | null;
    emailChangedAt?: Date | null;
  }
}