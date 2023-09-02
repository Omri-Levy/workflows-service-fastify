import { InternalServerErrorSchema } from "@/common/schemas/http-schemas";

export const LiveRouteSchema = {
  description: "Checks if the service is live.",
  tags: ["Health"],
  response: {
    204: {
      type: "null",
      description: "The service is live."
    },
    500: InternalServerErrorSchema
  }
};