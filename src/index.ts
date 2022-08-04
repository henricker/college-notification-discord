import { Client, GatewayIntentBits } from 'discord.js';
import { MailWatcherService } from './application/services/mail-watcher.service';
import { imapConfig } from './infra/config/imap';
import { DiscordService } from './infra/services/discord.service';
import { FetchMailService } from './infra/services/fetch-mail.service';

(async () => {
  const discordService = new DiscordService(
    new Client({
      intents: GatewayIntentBits.Guilds
    })
  );
  const mailWatcher = new MailWatcherService(
    new FetchMailService(imapConfig),
    discordService
  );

  await discordService.connect();
  await mailWatcher.listenEvents().watch(15000);
})();
