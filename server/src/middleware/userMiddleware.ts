import type { NextFunction, Response } from "express";
import asyncHandler from "./asyncHandler";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/RequestTypes";
import User from "../models/userModel";

// Middleware to check if the user is an admin
export const isAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: () => void) => {

  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
});

export const authenticate = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  const token = authHeader.split(" ")[1];

  if (token) {
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;

      // ✅ Сохраняем в req.user
      req.user = {
        userId: decode.userId,
        role: decode.role,
      };

      const userExists = await User.findById(decode.userId);
      if (!userExists) {
        res.status(401);
        throw new Error("User not found");
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("No auth No token");
  }
});
