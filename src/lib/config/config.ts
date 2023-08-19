import { z } from 'zod';

import { ConfigSchema } from './config-schema';
import { InvalidEnvironmentVariablesError } from './invalid-environment-variables-error';

/* c8 ignore start */
if (process.env['LOAD_DOTENV'] === 'true') {
  void (async () => {
    const dotenv = await import('dotenv');

    dotenv.config();
  })();
}
/* c8 ignore stop */

type ConfigInterface = z.infer<typeof ConfigSchema>;

class LazyConfig implements ProxyHandler<ConfigInterface> {
  private validatedConfig: ConfigInterface | undefined;

  public get(_: ConfigInterface, property: keyof ConfigInterface) {
    this.validatedConfig ??= validateConfig();

    return Reflect.get(this.validatedConfig, property);
  }
}

// The config object is lazy loaded to prevent it from being loaded before the environment variables are set. (for example, in automated tests)
export const config = new Proxy({} as ConfigInterface, new LazyConfig());

function validateConfig() {
  const environmentVariables = { ...process.env };

  const validationResult = ConfigSchema.safeParse(environmentVariables);

  if (!validationResult.success) {
    throw new InvalidEnvironmentVariablesError(validationResult.error);
  }

  return validationResult.data;
}
