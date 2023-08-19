declare global {
  // eslint-disable-next-line no-var
  var __rootdir__: string;

}

declare module "fastify" {

  interface FastifyRequest {

    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };

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