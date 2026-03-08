const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function send({ recipient, subject, body }) {
  const response = await resend.emails.send({
    from: 'OpenCourier <courier@mail.opencourier.org>',
    to: recipient,
    subject: subject || 'Message from OpenCourier',
    text: body,
  });
  return { externalId: response.data?.id || response.id, status: 'sent' };
}

module.exports = { send };
