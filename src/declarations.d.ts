import { User } from "@prisma/client";
import { TProjectIds } from "@/types";

declare global {
  // eslint-disable-next-line no-var
  var __rootdir__: string;

}

declare module "fastify" {

  interface PassportUser extends Pick<User, "id" | "email" | "firstName" | "lastName"> {
    projectIds: TProjectIds;
  }

  interface FastifyRequest {

    id: string;
    startTime: number;
    file: {
      path: string;
      location?: string;
      key: string;
    };
  }

}

export {};