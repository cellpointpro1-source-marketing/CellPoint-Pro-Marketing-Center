import { CreatePosLaunchRequestBody } from "@workspace/api-zod";

export const POS_LAUNCH_NOT_READY =
  "Secure POS launch exchange is not enabled yet. Use the standalone sign-in flow until production SSO is configured.";

export function parsePosLaunchRequest(input: unknown) {
  return CreatePosLaunchRequestBody.safeParse(input);
}