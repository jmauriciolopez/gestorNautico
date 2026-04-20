const nodemailer = require('nodemailer');

// Valores obtenidos de d:/Code/gestorNautico/backend/.env
const config = {
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  user: 'resend',
  pass: 're_etyZbpfd_Gy6sKqbi2RyvdHxQFcZHL3TX', // RESEND_API_KEY detectada
  from: 'no-reply@gestornautico.com'
};

async function main() {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  console.log('--- Iniciando Prueba SMTP (Manual) ---');
  console.log('Host:', config.host);
  console.log('User:', config.user);
  console.log('From:', config.from);
  console.log('Target:', 'jmauricio_lopez@hotmail.com');
  console.log('--------------------------------------');

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: 'jmauricio_lopez@hotmail.com',
      subject: '⚓ Prueba de Conexión - Gestor Náutico',
      text: 'Hola Mauricio,\n\nEsta es una prueba de envío desde el Gestor Náutico usando SMTP (Resend).\n\nSi recibiste este mensaje, la configuración es correcta.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4f46e5;">⚓ Gestor Náutico</h2>
          <p>Hola <strong>Mauricio</strong>,</p>
          <p>Esta es una prueba de envío desde el <strong>Gestor Náutico</strong> usando SMTP (Resend).</p>
          <p>Si recibiste este mensaje, la configuración de correo es <strong>correcta y está operativa</strong>.</p>
          <br>
          <small style="color: #666;">Este es un mensaje automático de prueba.</small>
        </div>
      `,
    });

    console.log('Mensaje enviado con éxito!');
    console.log('ID del Mensaje:', info.messageId);
  } catch (error) {
    console.error('Error al enviar correo:', error);
  }
}

main();
