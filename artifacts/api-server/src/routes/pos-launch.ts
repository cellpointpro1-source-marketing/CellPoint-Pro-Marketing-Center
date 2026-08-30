import { Router, type IRouter } from "express";
import { parsePosLaunchRequest, POS_LAUNCH_NOT_READY } from "../lib/pos-launch";

const router: IRouter = Router();

/**
 * Contract-first placeholder for the eventual secure POS-to-browser exchange.
 * This validates the future request shape but intentionally does not create a
 * session, trust URL parameters, or implement SSO.
 */
router.post("/pos/launch", (req, res): void => {
  const parsed = parsePosLaunchRequest(req.body);

  if (!parsed.success) {
    req.log.warn({ issueCount: parsed.error.issues.length }, "Invalid POS launch request");
    res.status(400).json({ error: "Invalid POS launch request." });
    return;
  }

  req.log.info({ storeId: parsed.data.storeId }, "POS launch request received; secure exchange is not enabled");
  res.status(501).json({ error: POS_LAUNCH_NOT_READY });
});

export default router;