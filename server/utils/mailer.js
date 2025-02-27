// mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter;

async function configureTransporter() {
    transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", 
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false // Allow self-signed certificates (optional)
        }
    });
      await transporter.verify()
  .then(() => {
    console.log("SMTP connection established successfully.");
  })
  .catch(err => {
    console.error("SMTP connection failed:", err);
    console.error("Error stack trace:", err.stack);
  });
}

configureTransporter();


module.exports = {
   
sendEmail : async(email, text) => {
    const mailOptions = {
      from: '"Student Database Platform" <no-reply@yourdomain.com>',
      to: email,
      subject: "Message from Admin \n Please pay the fees immediately",    
      text,
    };
  
    await transporter.sendMail(mailOptions);
  },
  sendOtp : async(email,otp) => {
    const  mailOptions = {
      from: '"Student Database Platform" <no-reply@yourdomain.com>',
      to: email,
      subject: 'Your OTP for Password Change',
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  };


  await transporter.sendMail(mailOptions);
},
sendBulkEmail : async(emails, text) => {
  const mailOptions = {
    from: '"Student Database Platform" <no-reply@yourdomain.com>',
    to: emails.join(','), // Convert array to comma-separated string
    subject: 'Message from Admin',
    text,
  };


    await transporter.sendMail(mailOptions);

  },
sendProfileCompletionEmail : async(email, missingFields) => {
  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "Complete Your Student Profile",
    text: `Dear Student,\n\nYour profile is incomplete. Please update the following fields in the dashboard:\n\n ${missingFields.join(", ")}.\n\nRegards,\nAdmin`
};

try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${email}`);
} catch (error) {
    console.error("Error sending email:", error);
}


}
}
