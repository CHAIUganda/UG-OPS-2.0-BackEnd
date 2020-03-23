const nodemailer = require('nodemailer');
const debug = require('debug')('server');

const Mailer = (from, to, subject, text, cc) => {
  // Send the email
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com', // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    requireTLS: true,
    tls: {
      ciphers: 'SSLv3'
    },
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  });
  const mailOptions = {
    from,
    to,
    subject,
    text,
    cc
  };
  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      debug(err.message);
    }
  });
};

module.exports = Mailer;
