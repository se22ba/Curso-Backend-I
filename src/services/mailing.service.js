const nodemailer = require('nodemailer');

class MailingService {
  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    this.from = process.env.SMTP_FROM || user;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined
    });
  }

  async sendPasswordReset(to, resetUrl) {
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.4">
        <h2>Recuperación de contraseña</h2>
        <p>Hacé click en el botón para restablecer tu contraseña. El enlace expira en 1 hora.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:10px 14px;background:#111;color:#fff;text-decoration:none;border-radius:6px">
            Restablecer contraseña
          </a>
        </p>
        <p>Si no fuiste vos, ignorá este mensaje.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Recuperación de contraseña',
      html
    });
  }
}

module.exports = MailingService;