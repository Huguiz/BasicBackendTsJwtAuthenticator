import nodemailer from "nodemailer";
import { EMAIL_PASSWORD, EMAIL_SERVER, EMAIL_USER } from "../constants/env";

type Params = {
    server?: string,
    user?: string,
    password?: string,
};

const transporter = (
    {
        server = EMAIL_SERVER,
        user = EMAIL_USER,
        password = EMAIL_PASSWORD,
    }: Params = {}) =>
    nodemailer.createTransport({
        host: server,
        port: 465,
        secure: true,
        auth: {
            user,
            pass: password
        },
    });


export default transporter;
