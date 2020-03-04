const nodemailer = require('nodemailer');
const debug = require('debug')('server');

const Mailer = (from, to, subject, text, res) => {
  // Send the email
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    secureConnection: false,
    port: 587,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  });
  const mailOptions = {
    from,
    to,
    subject,
    text
  };
  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      debug(err.message);
      return res.status(500).json({ message: `${err.message}` });
    }
  });
};

module.exports = Mailer;
