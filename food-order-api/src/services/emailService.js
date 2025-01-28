const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService
{
  constructor()
  {
    const isDevelopment = process.env.NODE_ENV === 'development';

    this.transporter = nodemailer.createTransport({
      host: isDevelopment ? 'localhost' : process.env.SMTP_HOST,
      port: isDevelopment ? 1025 : process.env.SMTP_PORT,
      secure: isDevelopment ? false : process.env.SMTP_SECURE === 'true',
      // For MailHog, we explicitly set auth to false
      ...(isDevelopment ? {} : {
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      }),
      // Additional settings for development
      ...(isDevelopment && {
        ignoreTLS: true,
        requireTLS: false
      })
    });

    // Verify connection
    this.verifyConnection();
  }

  async verifyConnection()
  {
    try
    {
      await this.transporter.verify();
      logger.info('SMTP server is ready to send messages');
    } catch (error)
    {
      logger.error('SMTP connection error:', error);
    }
  }

  // Initialize email templates
  #emailTemplates = {
    welcome: {
      subject: 'Welcome to FoodOrder!',
      html: (name) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to FoodOrder, ${name}!</h2>
          <p>We're excited to have you on board. With FoodOrder, you can:</p>
          <ul>
            <li>Order from your favorite restaurants</li>
            <li>Track your deliveries in real-time</li>
            <li>Save your favorite meals</li>
          </ul>
          <p>Start exploring our menu now!</p>
          <a href="${process.env.FRONTEND_URL}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Visit FoodOrder
          </a>
          <p>If you have any questions, feel free to reply to this email.</p>
          <p>Best regards,<br>The FoodOrder Team</p>
        </div>
      `
    },
    passwordReset: {
      subject: 'Reset Your Password',
      html: (resetLink) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email or contact support if you're concerned.</p>
          <p>Best regards,<br>The FoodOrder Team</p>
        </div>
      `
    },
    orderConfirmation: {
      subject: 'Order Confirmation',
      html: (orderDetails) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Order Confirmation</h2>
          <p>Thank you for your order! Here are your order details:</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            <p><strong>Total Amount:</strong> $${orderDetails.total.toFixed(2)}</p>
            <p><strong>Delivery Address:</strong> ${orderDetails.address}</p>
            <p><strong>Estimated Delivery Time:</strong> ${orderDetails.estimatedDelivery}</p>
          </div>
          <h3>Order Items:</h3>
          <ul style="list-style: none; padding: 0;">
            ${orderDetails.items.map(item => `
              <li style="margin-bottom: 10px;">
                ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}
              </li>
            `).join('')}
          </ul>
          <p>Track your order here:</p>
          <a href="${process.env.FRONTEND_URL}/orders/${orderDetails.orderId}"
             style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Track Order
          </a>
        </div>
      `
    }
  };

  // Generic send email method
  async #sendEmail(to, subject, html)
  {
    try
    {
      const mailOptions = {
        from: process.env.NODE_ENV === 'development'
          ? 'test@localhost.com'  // MailHog default sender
          : `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to,
        previewUrl: process.env.NODE_ENV === 'development'
          ? `http://localhost:8025/api/v2/messages/${info.messageId}` // MailHog web interface
          : null
      });
      return info;
    } catch (error)
    {
      logger.error('Error sending email', { error, to, subject });
      throw error;
    }
  }

  // Public methods for different email types
  async sendWelcomeEmail(email, name)
  {
    const template = this.#emailTemplates.welcome;
    return this.#sendEmail(
      email,
      template.subject,
      template.html(name)
    );
  }

  async sendPasswordResetEmail(email, resetLink)
  {
    const template = this.#emailTemplates.passwordReset;
    return this.#sendEmail(
      email,
      template.subject,
      template.html(resetLink)
    );
  }

  async sendOrderConfirmationEmail(email, orderDetails)
  {
    const template = this.#emailTemplates.orderConfirmation;
    return this.#sendEmail(
      email,
      template.subject,
      template.html(orderDetails)
    );
  }

  // Method for sending custom emails
  async sendCustomEmail(to, subject, htmlContent)
  {
    return this.#sendEmail(to, subject, htmlContent);
  }
}

// Create a singleton instance
const emailService = new EmailService();

module.exports = emailService;
