import transporter from "../config/email";
import { EMAIL_USER } from "../constants/env";

type Params = {
    from?: string;
    to: string;
    subject: string;
    html: string;
};

export const sendMail =
    async (
        {
            from = EMAIL_USER,
            to,
            subject,
            html
        }: Params
    ) =>
        await transporter().sendMail({
            from,
            to,
            subject,
            html,
        });
