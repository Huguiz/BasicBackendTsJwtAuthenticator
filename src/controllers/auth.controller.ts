import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import SessionModel from "../models/session.model";
import {
    createAccount,
    loginUser,
    refreshUserAccessToken,
    resetPassword,
    sendPasswordResetEmail,
    verifyEmail
} from "../services/auth.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import {
    clearAuthCookie,
    getAccessTokenCookieOptions,
    getRefreshTokenCookieOptions,
    setAuthCookies
} from "../utils/cookies";
import { verifyToken } from "../utils/jwt";
import {
    emailSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
    verificationCodeSchema
} from "./auth.schemas";

export const registerHandler = catchErrors(async (req, res) => {
    const request = registerSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });

    const { user, accessToken, refreshToken } = await createAccount(request);

    return setAuthCookies({ res, accessToken, refreshToken })
        .status(CREATED)
        .json(user);
});

export const loginHandler = catchErrors(async (req, res) => {
    const request = loginSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });

    const {
        accessToken, refreshToken,
    } = await loginUser(request);

    return setAuthCookies({ res, accessToken, refreshToken }).status(OK).json({
        message: "Login successful",
    });
});

export const logoutHandler = catchErrors(async (req, res) => {
    const accessToken = req.cookies.accessToken as string | undefined;
    const { payload } = verifyToken(accessToken || "");

    if (payload) {
        await SessionModel.findByIdAndDelete(payload.sessionId);
    }

    return clearAuthCookie(res).status(OK).json({
        message: "Logout successfull",
    });
});

export const refreshHandler = catchErrors(async (req, res) => {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");

    const { accessToken, newRefreshToken } = await refreshUserAccessToken(refreshToken);

    if (newRefreshToken) {
        res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
    };

    return res
        .status(OK)
        .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
        .json({
            message: "Acces token refreshed",
        });
});

export const verifyEmailHandler = catchErrors(async (req, res) => {
    const verificationCode = verificationCodeSchema.parse(req.params.code);

    await verifyEmail(verificationCode);

    return res.status(OK).json({
        message: "Email was successfully verified",
    });
});

export const sendPasswordResetHandler = catchErrors(async (req, res) => {
    const email = emailSchema.parse(req.body.email);

    await sendPasswordResetEmail(email);

    return res.status(OK).json({
        message: "Paswword reset email sent",
    });
});

export const resetPasswordHandler = catchErrors(async (req, res) => {
    const request = resetPasswordSchema.parse(req.body);

    await resetPassword(request);

    return clearAuthCookie(res).status(OK).json({
        message: "Password reset successfull",
    });
});
