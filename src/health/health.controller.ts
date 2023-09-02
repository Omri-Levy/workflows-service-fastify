import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { liveRoute } from "@/health/live/live.route";
import { readyRoute } from "@/health/ready/ready.route";

export const healthController: FastifyPluginAsyncTypebox = async (fastify) => {

 await fastify.register(liveRoute);
 await fastify.register(readyRoute);

};

