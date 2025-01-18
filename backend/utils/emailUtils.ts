import { config } from "../config";
import nodemailer from 'nodemailer';
import { logger } from "./logger";


export const sendVerificationMail = (userMail: string, subject: string, message: string, verificationLink: string): void => {
    const senderMail: string = config.smtp.email
    const senderPassword: string = config.smtp.password
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: senderMail,
            pass: senderPassword,
        }
    });

    transporter.verify((error, success) => {
        if (error) {
            logger.error("SMTP configuration error: ", error);
        } else {
            logger.info("SMTP configuration is correct", success);
        }
    })
    
    transporter.sendMail({
        from: `"BookStore team" <${senderMail}>`,
        to: userMail,
        subject: subject,
        text: `Hi, ${userMail} \n${message} \n${verificationLink}\nRegards,\nBookStore Team`,
    }, (error, info) => {
        if (error) {
            return logger.error(error);
        }
        logger.info('Message sent: %s', info.messageId)
    });
    
}
