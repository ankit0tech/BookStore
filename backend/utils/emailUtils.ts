import { config } from "../config.js";
import { logger } from "./logger.js";
import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from "@getbrevo/brevo";

export const sendVerificationMail = (userMail: string, userName: string, subject: string, message: string, verificationLink: string): void => {
    const emailAPI = new TransactionalEmailsApi();
    emailAPI.setApiKey(TransactionalEmailsApiApiKeys.apiKey, config.brevo.api_key);

    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.textContent = `Hi, ${userMail} \n${message} \n${verificationLink}\nRegards,\nBookStore Team`
    sendSmtpEmail.sender = { name: "BookStore Team", email: config.smtp.email };
    sendSmtpEmail.to = [{ email: userMail, name: userName }];

    emailAPI.sendTransacEmail(sendSmtpEmail).then(res => {
        logger.info(JSON.stringify(res.body));
    }).catch(err => {
        logger.error("Error sending email:", err.body);
    });
}
