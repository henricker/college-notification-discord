import { Client, GatewayIntentBits } from 'discord.js';
import { MailWatcherService } from './application/services/mail-watcher.service';
import { imapConfig } from './infra/config/imap';
import { DiscordService } from './infra/services/discord.service';
import { FetchMailService } from './infra/services/fetch-mail.service';
import { CheckFilesService } from './infra/util/check-files.service';
import { DecodedService } from './infra/util/decode.service';

(async () => {
  const discordService = new DiscordService(
    new Client({
      intents: GatewayIntentBits.Guilds
    })
  );
  const mailWatcher = new MailWatcherService(
    new FetchMailService(imapConfig, new DecodedService()),
    discordService,
    new CheckFilesService()
  );

  await discordService.connect();
  await mailWatcher.listenEvents().watch(5000 * 60);
})();
