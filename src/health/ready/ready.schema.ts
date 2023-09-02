import { InternalServerErrorSchema } from "@/common/schemas/http-schemas";

export const ReadyRouteSchema = {
  description: "Checks if the service is ready, specifically if the database is ready.",
  tags: ["Health"],
  response: {
    204: {
      type: "null",
      description: "The service is ready."
    },
    404: {
      type: "null",
      description: "The service is not ready."
    },
    500: InternalServerErrorSchema
  }
};