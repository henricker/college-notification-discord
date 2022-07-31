import Imap from 'imap';

export const imap = new Imap({
    user: process.env.IMAP_USER as string ?? '',
    password: process.env.IMAP_PASSWORD as string ?? '',
    host: process.env.IMAP_HOST ?? '',
    port: Number(process.env.IMAP_PORT) ?? 1,
    tls: Boolean(process.env.IMAP_TLS) ?? true,
});