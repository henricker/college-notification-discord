export const CONSTANTS = {
  DOMAIN_MAILS: ['@ufc.br', '@quixada.ufc.br'],
  FETCH_MAILS_FROM_LAST_HOURS: 24 * 3600 * 1000, // 1 day => 24 hours
  INTERVAL_FETCH_MAILS: 5000 * 60, //five minutes
  MESSAGE_LENGTH_LIMIT_DISCORD: 2000,
  EVENTS: {
    FINISH_READ_MESSAGES: 'finish-read-messages',
    NOTHING_EMAIL_FOUNDED: 'nothing-email-founded'
  }
};
