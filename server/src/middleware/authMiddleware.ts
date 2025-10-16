import type { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import asyncHandler from "./asyncHandler";

// Расширение интерфейса Request для добавления свойства user
declare global {
  namespace Express {
    interface Request {
      user?: any; // Можно заменить any на конкретный тип User
    }
  }
}

// Middleware для проверки аутентификации
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Получаем user_id из заголовка или из body
  const userId = req.headers["user-id"] || req.body.user_id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Не авторизован, user-id не передан",
    });
  }

  try {
    // Находим пользователя по user_id
    const user = await User.findOne({ user_id: userId });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Не авторизован, пользователь не найден",
      });
    }

    // Добавляем пользователя в объект запроса

    req.user = user;
    next();
    return;
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Не авторизован",
    });
  }
});

// Middleware для проверки авторизации
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: "Нет прав доступа",
    });
  }
};

//можно все удалить
