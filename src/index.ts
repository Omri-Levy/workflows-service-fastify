import { build } from "@/server";
import { env } from "@/env";

void (async () => {
  const app = await build();

  void app.listen({
    port: env.PORT
  });
})();