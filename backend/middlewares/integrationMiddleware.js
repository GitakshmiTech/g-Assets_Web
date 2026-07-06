import { integrationConfig } from "../services/expenseIntegrationService.js";

export const authenticateIntegration = (req, res, next) => {
  const token = req.get("x-integration-token") || req.get("x-service-token") || req.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token !== integrationConfig.serviceToken) {
    return res.status(401).json({ success: false, message: "Invalid integration token" });
  }
  next();
};