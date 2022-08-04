import imaps from 'imap-simple';

export const imapConfig: imaps.ImapSimpleOptions = {
  imap: {
    user: (process.env.IMAP_USER as string) ?? '',
    password: (process.env.IMAP_PASSWORD as string) ?? '',
    host: process.env.IMAP_HOST ?? '',
    port: Number(process.env.IMAP_PORT) ?? 1,
    tls: Boolean(process.env.IMAP_TLS) ?? true,
    tlsOptions: {
      rejectUnauthorized: false
    },
    authTimeout: 10000
  }
};
