import { v4 as uuidv4 } from "uuid";
import logger from "../utils/logger.js";

export function requestLogger(req, res, next) {
  const requestId = uuidv4();

  req.requestId = requestId;

  req.log = logger.child({ requestId });

  req.log.info("Request started", {
    method: req.method,
    url: req.originalUrl
  });

  next();
}
