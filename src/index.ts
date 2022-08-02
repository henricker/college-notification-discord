import { config as imapConfig } from './infra/config/imap';
import { FetchMailService } from './infra/services/mail-listener.service';
import dotenv from 'dotenv';

dotenv.config({
  path: '../../.env'
});

(async () => {
  try {
    const fechMailService = new FetchMailService(imapConfig);

    fechMailService.on('finish-read-messages', (mails) => {
      console.log(mails);
    });

    (await fechMailService.connect())?.openBox('INBOX');
  } catch (err) {
    console.error(err);
  }
})();
