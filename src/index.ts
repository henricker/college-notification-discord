// import { config as imapConfig } from './infra/config/imap';
// import { FetchMailService } from './infra/services/fetch-mail.service';
// import dotenv from 'dotenv';
// import { MailWatcherService } from './application/services/mail-watcher.service';

import { Client, GatewayIntentBits } from 'discord.js';
import { DiscordService } from './infra/services/discord.service';

// dotenv.config({
//   path: '../../.env'
// });

// const mailWatcher = new MailWatcherService(new FetchMailService(imapConfig));

// //to each five minutes send request to find new mails
// mailWatcher.listenEvents().watch(5000 * 60);
(async () => {
  const client = new Client({
    intents: GatewayIntentBits.Guilds
  });
  const discordService = new DiscordService(client);
  await discordService.connect();
})();
