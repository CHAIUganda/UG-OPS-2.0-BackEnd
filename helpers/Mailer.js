const nodemailer = require('nodemailer');
const debug = require('debug')('server');

const Mailer = (from, to, subject, text, res) => {
  // Send the email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
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
    res
      .status(200)
      .json({ message: `A verification email has been sent to ${to}.` });
  });
};

module.exports = Mailer;
