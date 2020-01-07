const nodeMailerReal = require('nodemailer');
const nodeMailerMock = require('nodemailer-mock');

let nodeMailer = nodeMailerReal;
if (process.env.MODE && process.env.MODE === 'TEST') {
  nodeMailer = nodeMailerMock;
}

const mailer = nodeMailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = mailer;
