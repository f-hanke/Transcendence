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

export function addRequestCheckHook(fastify: FastifyInstance) {
  fastify.addHook("onRequest", async (req, reply) => {
    const url = req.raw.url || "";

    // Skip auth for these routes
    console.log("\n\n\n");
    console.log(chalk.yellow("RECEIVED REQUEST HERE!"));
    console.log(chalk.yellow(url));
    console.log("\n\n\n");

    const skipAuth =
      url === "/AUTHENTICATION/api/auth/register" ||
      url === "/AUTHENTICATION/api/auth/login" ||
      url.startsWith("/src/") ||
      url.startsWith("/assets/") ||
      url === "/index.css" ||
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
      url === "/userSettingsOwn";

    if (!skipAuth) {
      await authMiddleware(req, reply);

      if (isSensitiveUserUpdate(url)) {
        console.log("\n\n\n");
        console.log(chalk.yellow("Sensitive Route Check happening!"));


        if (!req.headers.authorization)
          return reply.code(400).send({ reason: AuthErrors.LackingAuthorizationHeader } satisfies AuthServiceTypes.ErrorResponseBody);
        const token = req.headers.authorization.split(' ')[1];

        try {
          const jwtPayload = await fastify.jwt.verify<{ userId: string }>(token);
          const userIdInUrl = url.split("/").filter(Boolean).pop();

          if (!jwtPayload.userId || !userIdInUrl || jwtPayload.userId != userIdInUrl) {
            return reply.code(403).send({ error: "Forbidden: User mismatch" });
          }
          console.log("\n\n\n");
        } catch (err) {
          console.error("Invalid token:", err);
          return null;
        }
      }
    } else {
      console.log("\n\n\n");
      console.log(chalk.yellow("Auth is skipped!"));
      console.log("\n\n\n");
    }
  });
}

// JWT auth middleware
async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    console.log("\n\n\n");
    console.log(chalk.yellow("HERE 111!"));
    console.log(chalk.yellow(authHeader));
    console.log("\n\n\n");
    if (!authHeader) throw new Error("No token");

    const token = authHeader.split(" ")[1];
    console.log("\n\n\n");
    console.log(chalk.yellow("HERE 2222!"));
    console.log(chalk.yellow(token));
    console.log("\n\n\n");
    const payload = request.server.jwt.verify(token) as { userId: string };

    console.log("\n\n\n");
    console.log(chalk.yellow("HERE 3333!"));
    console.log(chalk.yellow(payload));
    console.log("\n\n\n");

    (request as any).user = payload;
  } catch (err) {
    console.log(chalk.red("JWT VERIFICATION FAILED"));
    reply.code(401).send({ error: "Unauthorized" });
    return; // ✅ Stop request lifecycle here
  }
}
