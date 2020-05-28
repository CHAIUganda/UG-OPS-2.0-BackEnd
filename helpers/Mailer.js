const nodemailer = require('nodemailer');
const debug = require('debug')('server');

const Mailer = async (from, to, subject, text, cc, content, htmlAttach) => {
  // Send the email
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com', // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    requireTLS: true,
    tls: {
      ciphers: 'SSLv3',
    },
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  let mailOptions;

  if (content) {
    mailOptions = {
      from,
      to,
      subject,
      text,
      cc,
      icalEvent: {
        filename: 'contractRenewalInvitation.ics',
        method: 'request',
        content,
      },
    };
  } else if (htmlAttach) {
    mailOptions = {
      from,
      to,
      subject,
      text,
      cc,
      html: htmlAttach.html,
      attachments: htmlAttach.attachments,
    };
  } else {
    mailOptions = {
      from,
      to,
      subject,
      text,
      cc,
    };
  }

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      debug(err.message);
    }
  });
};

module.exports = Mailer;
