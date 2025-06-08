import chalk from "chalk";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AuthErrors, AuthServiceTypes } from "transcendence";

function isSensitiveUserUpdate(url: string): boolean {
  return [
    "/AUTHENTICATION/api/users/updatedisplayname/",
    "/AUTHENTICATION/api/users/updateemail/",
    "/AUTHENTICATION/api/users/updatepassword/",
    "/AUTHENTICATION/api/users/updatelanguage/",
    "/AUTHENTICATION/api/users/updateimage/",
  ].some((path) => url.startsWith(path));
}

export function enableJwtCheck(fastify: FastifyInstance) {
  fastify.addHook("onRequest", async (req, reply) => {
    const url = req.raw.url || "";

    // Skip auth for these routes
    console.log("\n");
    console.log(chalk.yellow("Received request!"));
    console.log(`url: ${chalk.yellow(url)}`);
    console.log("\n");

    // also include health
    // also include metrics

    const skipAuth =
      url === "/AUTHENTICATION/api/auth/register" ||
      url === "/AUTHENTICATION/api/auth/login" ||
      url.startsWith("/src/") ||
      url.startsWith("/assets/") ||
      url === "/index.css" ||
      url === "/favicon.ico" ||
      url === "/favicon-16x16.png" ||
      url === "/favicon-32x32.png" ||
      url === "/" ||
      url === "/loginPage" ||
      url === "/registerPage" ||
      url === "/matchmaking" ||
      url === "/oneVOneLocal" ||
      url === "/userSettings" ||
      url === "/manageMatch" ||
      url === "/home" ||
      url === "/chat" ||
      url === "/userSettingsOther" ||
      url === "/currentTournament" ||
      url === "/userSettingsOwn" ||
      url === "/AUTHENTICATION/health" ||
      url === "/MATCHMAKING/health" ||
      url === "/GAMESERVICE/health" ||
      url === "/CHATSERVICE/health" ||
      url === "/health" ||  // API gateway health check
      url === "/metrics"    // Prometheus metrics endpoint
      // url.startsWith("/CHATSERVICE/ws") ||  // Chat WebSocket
      // url.startsWith("/GAMESERVICE/ws") ||  // Game WebSocket  
      // url.startsWith("/MATCHMAKING/ws");    // Matchmaking WebSocket

    if (!skipAuth) {
      await authMiddleware(req, reply);

      if (isSensitiveUserUpdate(url)) {
        console.log("\n");
        console.log(chalk.yellow("Sensitive Route Check is happening!"));
        console.log("\n");

        if (!req.headers.authorization)
          return reply
            .code(400)
            .send({
              reason: AuthErrors.LackingAuthorizationHeader,
            } satisfies AuthServiceTypes.ErrorResponseBody);
        const token = req.headers.authorization.split(" ")[1];

        try {
          const jwtPayload = await fastify.jwt.verify<{ userId: string }>(
            token
          );
          const userIdInUrl = url.split("/").filter(Boolean).pop();

          if (
            !jwtPayload.userId ||
            !userIdInUrl ||
            jwtPayload.userId != userIdInUrl
          ) {
            return reply.code(403).send({ error: "Forbidden: User mismatch" });
          }
        } catch (err) {
          console.error("Sensitive Route Check error:", err);
          return null;
        }
      }
    } else {
      console.log("\n");
      console.log(chalk.yellow("Auth was skipped!"));
      console.log("\n");
    }
  });
}

// JWT auth middleware
async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    console.log("\n");
    console.log(chalk.yellow("Auth header"));
    console.log(chalk.yellow(authHeader));
    console.log("\n");
    if (!authHeader) throw new Error("No token");

    const token = authHeader.split(" ")[1];
    const payload = request.server.jwt.verify(token) as { userId: string };

    console.log("\n");
    console.log(chalk.yellow("Decrypted JWT"));
    console.log(chalk.yellow(JSON.stringify(payload, null, 2)));
    console.log("\n");

    (request as any).user = payload;
  } catch (err) {
    console.log(chalk.red("JWT VERIFICATION FAILED"));
    reply.code(401).send({ error: "Unauthorized" });
    return; // ✅ Stop request lifecycle here
  }
}
