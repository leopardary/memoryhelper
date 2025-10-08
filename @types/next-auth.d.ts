import { Permission } from "@/lib/db/model/types/Role.types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      defaultRole?: string;
      isAdmin?: boolean;
      permissions?: Permission[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    defaultRole?: string;
  }
}

export declare module 'next-auth' {}