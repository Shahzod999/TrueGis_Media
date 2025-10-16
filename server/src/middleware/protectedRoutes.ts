import type { Request, Response, NextFunction } from "express";

const allowedReferer = process.env.ALLOWED_ROUTES;

const protectedRoutes = (req: Request, res: Response, next: NextFunction) => {
  const referer = req.headers.referer;

  if (!referer || !allowedReferer?.includes(referer)) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  next();
};

export default protectedRoutes;
