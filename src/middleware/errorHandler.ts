import { z } from "zod";
import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import AppError from "../utils/appError";
import { clearAuthCookie, REFRESH_PATH } from "../utils/cookies";

const handleZodError = (res: Response, error: z.ZodError) => {
    const errors = error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
    }));
    return res.status(BAD_REQUEST).json({
        message: error.message,
        errors,
    });
};

const handleAppError = (res: Response, error: AppError) => {
    return res.status(error.statusCode).json({
        message: error.message,
        errorCode: error.errorCode,
    });
};

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {

    if (req.path === REFRESH_PATH) {
        clearAuthCookie(res);
    };

    if (error instanceof z.ZodError) {
        handleZodError(res, error);
        return; // AJOUTE !
    };

    if (error instanceof AppError) {
        handleAppError(res, error);
        return; // AJOUTE !
    };

    console.log(`PATH: ${req.path}`, error);
    res.status(INTERNAL_SERVER_ERROR).send("Internal server error");
};

export default errorHandler;
