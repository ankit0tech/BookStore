import { config } from "../config";
import nodemailer from 'nodemailer';


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
            console.log("SMTP configuration error: ", error);
        } else {
            console.log("SMTP configuration is correct", success);
        }
    })
    
    transporter.sendMail({
        from: `"BookStore team" <${senderMail}>`,
        to: userMail,
        subject: subject,
        text: `Hi, ${userMail} \n${message} \n${verificationLink}\nRegards,\nBookStore Team`,
    }, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId)
    });
    
}
