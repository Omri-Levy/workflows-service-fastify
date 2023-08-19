import { z } from "zod";
import { LogSchema } from "./log-schema";
import { groupByPrefix } from "./utils/group-by-prefix";
import { isObject } from "@ballerine/common";

const groupNames = [
  "LOG",
];

export const ConfigSchema = z
  .preprocess(
    (config) => {
      if (!isObject(config)) {
        return config;
      }

      return {
        ...config,
        ...groupByPrefix(config, groupNames)
      };
    },
    z.object({

      ENVIRONMENT_NAME: z
        .enum(["production", "staging", "development"])
        .default("development")
        .describe(
          `
					Environment name.
					Used for logging purposes only.
					No conditions should be based on this variable.`
        ),

      LOG: LogSchema.describe("Logging-related configuration")


    })
  )
  .transform((config) => {
    return {
      environmentName: config.ENVIRONMENT_NAME,
      log: config.LOG
    };
  });
