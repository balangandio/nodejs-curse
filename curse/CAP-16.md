# Cap 16

# 267 Using SendGrid
--> `nodemailer` é um pacote que implementa um cliente para envio de e-mails.
* Install: `npm install --save nodemailer`

# 268 Using Nodemailer to Send an Email
--> Envio de e-mail utilizando Google SMTP service:
```javascript
const nodemailer = require('nodemailer');

cosnt transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: 'username@gmail.com',
        pass: 'password',
    },
});

transporter.sendMail({
    from: '"Universo42.10" <universo42.10@gmail.com>',
    to: "universo42.01@gmail.com",
    subject: "Just a test: login page",
    text: "Testing google smtp.",
}).then(info => {
    console.log("Message sent: %s", info.messageId);
});
```