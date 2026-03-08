const emailService = require('./emailService');

async function sendMessage(channel, payload) {
  switch (channel) {
    case 'email':
      return await emailService.send(payload);
    case 'slack':
      throw new Error('Slack integration not yet configured');
    default:
      throw new Error(`Unsupported channel: ${channel}`);
  }
}

module.exports = { sendMessage };
