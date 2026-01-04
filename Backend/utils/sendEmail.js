const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL || process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
        },
    });

    // Define the email options
    const fromName = process.env.FROM_NAME || 'SquadUp Support';
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_EMAIL || process.env.SMTP_USER;

    const mailOptions = {
        from: `${fromName} <${fromEmail}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
