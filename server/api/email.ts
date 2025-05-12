import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { log } from '../vite';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Bu bir test transporter'ı - gerçek ortamda SMTP bilgilerinizi kullanın
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
});

// E-posta gönderme fonksiyonu
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    log('Email credentials not set. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.', 'email');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: '"İslami Sosyal Ağ" <bilgi@islamisosyalag.com>',
      to,
      subject,
      html,
    });

    log(`Email sent: ${info.messageId}`, 'email');
    return true;
  } catch (error) {
    log(`Error sending email: ${error}`, 'email');
    return false;
  }
}

// Doğrulama e-postası içeriği
export function getVerificationEmailHtml(username: string, token: string): string {
  const verificationUrl = `${process.env.APP_URL || 'http://localhost:5000'}/verify-email?token=${token}`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #006400;">İslami Sosyal Ağ</h1>
        <div style="height: 5px; background: linear-gradient(to right, #006400, #228B22, #006400); margin: 15px 0;"></div>
      </div>
      
      <h2 style="color: #333; margin-bottom: 20px;">E-posta Adresinizi Doğrulayın</h2>
      
      <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">
        Değerli ${username},
      </p>
      
      <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
        İslami Sosyal Ağ platformuna kayıt olduğunuz için teşekkürler. E-posta adresinizi doğrulamak için lütfen aşağıdaki butona tıklayın:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #006400; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          E-posta Adresimi Doğrula
        </a>
      </div>
      
      <p style="color: #555; font-size: 15px; line-height: 1.5; margin-bottom: 15px;">
        Eğer butona tıklamakta sorun yaşıyorsanız, aşağıdaki bağlantıyı tarayıcınıza kopyalayabilirsiniz:
      </p>
      
      <p style="background-color: #f9f9f9; padding: 10px; border-radius: 3px; word-break: break-all; font-size: 14px;">
        ${verificationUrl}
      </p>
      
      <p style="color: #555; font-size: 15px; line-height: 1.5; margin-top: 30px;">
        Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayınız.
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 14px;">
        <p style="margin-bottom: 10px;">
          Saygılarımızla,<br>
          İslami Sosyal Ağ Ekibi
        </p>
        <p style="font-size: 12px; color: #999;">
          Bu otomatik bir e-postadır, lütfen cevap vermeyiniz.
        </p>
      </div>
    </div>
  `;
}

// Şifre sıfırlama e-postası içeriği
export function getPasswordResetEmailHtml(username: string, token: string): string {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:5000'}/reset-password?token=${token}`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #006400;">İslami Sosyal Ağ</h1>
        <div style="height: 5px; background: linear-gradient(to right, #006400, #228B22, #006400); margin: 15px 0;"></div>
      </div>
      
      <h2 style="color: #333; margin-bottom: 20px;">Şifre Sıfırlama Talebi</h2>
      
      <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">
        Değerli ${username},
      </p>
      
      <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
        Hesabınız için bir şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için lütfen aşağıdaki butona tıklayın:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #006400; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Şifremi Sıfırla
        </a>
      </div>
      
      <p style="color: #555; font-size: 15px; line-height: 1.5; margin-bottom: 15px;">
        Eğer butona tıklamakta sorun yaşıyorsanız, aşağıdaki bağlantıyı tarayıcınıza kopyalayabilirsiniz:
      </p>
      
      <p style="background-color: #f9f9f9; padding: 10px; border-radius: 3px; word-break: break-all; font-size: 14px;">
        ${resetUrl}
      </p>
      
      <p style="color: #555; font-size: 15px; line-height: 1.5; margin-top: 30px;">
        Bu sıfırlama talebini siz yapmadıysanız, lütfen hesabınızın güvenliğini kontrol edin ve gerekirse bize bildirin.
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 14px;">
        <p style="margin-bottom: 10px;">
          Saygılarımızla,<br>
          İslami Sosyal Ağ Ekibi
        </p>
        <p style="font-size: 12px; color: #999;">
          Bu otomatik bir e-postadır, lütfen cevap vermeyiniz.
        </p>
      </div>
    </div>
  `;
}

// Bildirim e-postası içeriği
export function getNotificationEmailHtml(username: string, notificationText: string, actionUrl: string, actionText: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #006400;">İslami Sosyal Ağ</h1>
        <div style="height: 5px; background: linear-gradient(to right, #006400, #228B22, #006400); margin: 15px 0;"></div>
      </div>
      
      <h2 style="color: #333; margin-bottom: 20px;">Yeni Bildirim</h2>
      
      <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">
        Değerli ${username},
      </p>
      
      <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
        ${notificationText}
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${actionUrl}" style="background-color: #006400; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          ${actionText}
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 14px;">
        <p style="margin-bottom: 10px;">
          Saygılarımızla,<br>
          İslami Sosyal Ağ Ekibi
        </p>
        <p style="font-size: 12px; color: #999;">
          Bu otomatik bir e-postadır, lütfen cevap vermeyiniz.
        </p>
      </div>
    </div>
  `;
}

// Token oluşturma
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}