const nodemailer = require('nodemailer');

//TODO finish this
const writeVerificationEmail = (email, rand, fn) => {
    console.log("writeVerification");
    nodemailer.createTestAccount()
        .then((testAccount) => {
            // create reusable transporter object using the default SMTP transport
            console.log("Node mailer time");
            let transporter = nodemailer.createTransport({
                // host: "smtp.ethereal.email",
                // host: "localhost",
                // port: 587,
                service: "Gmail",
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER, // generated ethereal user
                    pass: process.env.EMAIL_PASS, // generated ethereal password
                },
            });
            console.log(process.env.EMAIL_USER);

            console.log("created transport obj");
            console.log(transporter);
            transporter.verify(function(error, success) {
                if (error) {
                    console.log("Error");
                    console.log(error);
                } else {
                    console.log("Server is ready");

                }
            })

            let url = process.env.HOST_NAME;
            if (url === "localhost") {
                url = url + ":4000";
            }
            if (!url.startsWith("http")) {
                url = "http://" + url;
            }

            url = url + "/api/email/" + rand;

            console.log(url);

            transporter.sendMail({
                from: 'zjpetersen12@gmail.com', // sender address
                to: "zjpetersen12@gmail.com", // list of receivers
                subject: "Confirm your subscription", // Subject line
                // text: "Hello world?" , // plain text body
                html: '<div>Thanks for signing up!  Click the link to get updates on the project and be the first to hear when we go to Mainnet! </div><div><a href="' + url + '">Confirm your email</a></div>', // html body
            })
            .then((info) => {
                console.log(info);
                console.log("Message sent: %s", info.messageId);
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                // Preview only available when sending through an Ethereal account
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                fn(info);
                });


        });


}

exports.writeVerificationEmail = writeVerificationEmail;