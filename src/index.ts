import { config as imapConfig } from './infra/config/imap';
import { FetchMailService } from './infra/services/fetch-mail.service';
import dotenv from 'dotenv';
import { MailWatcherService } from './application/services/mail-watcher.service';

dotenv.config({
  path: '../../.env'
});

const mailWatcher = new MailWatcherService(new FetchMailService(imapConfig));

//to each five minutes send request to find new mails
mailWatcher.watch(5000 * 60);
