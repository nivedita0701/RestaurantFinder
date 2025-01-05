const User = require('../models/User');
const validator = require('validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { sendVerificationEmail } = require('../utils/emailService');
const { sequelize } = require('../config/db'); // Ensure this is the correct path
const { Op } = require('sequelize');


// @desc Get user profile
// @route GET /api/users/profile
// @access Private
exports.getUserProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (user) {
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};


exports.updateUserProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isPasswordChanged = req.body.password && req.body.password !== user.password;

  const { name, email } = req.body;

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use by another account' });
    }

    // Send verification email
    try {
      await sendVerificationEmail(user.id, email);
      user.email = email; // Update the email only after sending the email verification
    } catch (err) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }
  }

  user.name = name || user.name;

  if (isPasswordChanged) {
    user.password = req.body.password; // Password hashing handled in model
  }


  try {
    const updatedUser = await user.save();

    if (isPasswordChanged) {
      try {
        await sendEmail(
          updatedUser.email,
          'Your Password Was Changed',
          'Your password has been updated successfully. If this was not you, please reset your password immediately.'
        );
      } catch (error) {
        console.error('Error sending password change email:', error.message);
      }
    }

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      message: email ? 'Profile updated. Please verify your new email.' : 'Profile updated successfully.',
    });
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};


exports.changeUserPassword = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (user) {
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Prevent changing to the same password
    const isSameAsCurrent = await user.comparePassword(req.body.newPassword);
    if (isSameAsCurrent) {
      return res.status(400).json({ message: 'New password cannot be the same as the current password' });
    }

     // Validate new password
     if (!validator.isStrongPassword(req.body.newPassword, { minLength: 8, minSymbols: 1, minNumbers: 1 })) {
        return res.status(400).json({
          message: 'Password must be at least 8 characters long, contain a number, a symbol, and an uppercase letter',
        });
      }

    user.password = req.body.newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    // Generate a secure token
    

    // Hash the token and set it in the database
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
    await user.save();

    // Create reset link
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 10 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Error sending reset email:', error.message);
    res.status(500).json({ message: 'Failed to send reset link' });
  }
};

// Function to handle password reset
exports.resetPassword = async (req, res) => {
  const { token } = req.params; // Extract token from URL
  const { password } = req.body; // Get new password from request body
  try {
    // Hash token and find user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { [Op.gt]: Date.now() }, // Ensure token hasn't expired
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // Update user's password
    user.password = password; // Ensure the `User` model hashes the password
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error.message);
    res.status(500).json({ message: 'An error occurred while resetting password.' });
  }
};