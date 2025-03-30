import { Router } from "express";
import getUserHandler from "../services/user.service";

const userRoutes = Router();

// prefix: /user

userRoutes.get("/", getUserHandler);

export default userRoutes;
