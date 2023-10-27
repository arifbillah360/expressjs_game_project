const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1 - Create transporter
  const transporter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
      user: process.env.SENDGRID_USERNAME,
      pass: process.env.SENDGRID_PASSWORD,
    },
  });

  // 2 - Define the email options
  const mailOptions = {
    from: "OOCOUP Game Support <andrewlaurentiu94@gmail.com>",
    to: options.emailTo,
    subject: options.subject,
    text: options.text,
    html: ` <html>
    <body>
      <div style="text-align: center;">
        <p>This is the HTML version of the email</p>
        <a href="https://your-link-here.com" style="background-color: blue; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Click Me</a>
      </div>
    </body>
  </html>`,
  };

  // 3 - Send the email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
