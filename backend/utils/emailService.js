const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send verification email
const sendVerificationEmail = async (userId, email) => {
  const verificationLink = `http://localhost:3000/verify-email/${userId}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <h2>Email Verification</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error.message);
    throw new Error('Failed to send verification email');
  }
};

const sendStatusUpdateEmail = async (email, restaurantName, status) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Update on Your Restaurant: ${restaurantName}`,
    html: `
      <h2>Status Update</h2>
      <p>The status of your restaurant <strong>${restaurantName}</strong> has been updated to <strong>${status}</strong>.</p>
      <p>If you have any questions, please contact our support team.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Status update email sent to ${email}`);
  } catch (error) {
    console.error('Error sending status update email:', error.message);
    throw new Error('Failed to send status update email');
  }
};


// Function to send business registration email
const sendBusinessRegistrationEmail = async (email, restaurantName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Business Registration',
    html: `
      <h2>Business Registered</h2>
      <p>Your business "${restaurantName}" has been registered successfully.</p>
      <p>Our team will review the details, and you will be notified once approved.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Business registration email sent to ${email}`);
  } catch (error) {
    console.error('Error sending business registration email:', error.message);
    throw new Error('Failed to send business registration email');
  }
};

module.exports = { sendVerificationEmail, sendBusinessRegistrationEmail, sendStatusUpdateEmail };
