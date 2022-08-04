import { discordConfig } from '../../infra/config/discord';
import { DiscordService } from '../../infra/services/discord.service';
import {
  FetchMailService,
  MailType
} from '../../infra/services/fetch-mail.service';

export class MailWatcherService {
  constructor(
    private readonly fetchMailService: FetchMailService,
    private readonly discordService: DiscordService
  ) {}

  listenEvents() {
    this.fetchMailService.on(
      'finish-read-messages',
      this.handleOnFinishReadMailsFounded.bind(this)
    );

    this.fetchMailService.on(
      'nothing-email-founded',
      this.handleOnNothingMailsFounded.bind(this)
    );

    return this;
  }

  async watch(interval: number) {
    setInterval(this.handleWatchMails.bind(this), interval);
  }

  private async handleOnFinishReadMailsFounded(mails: MailType[]) {
    mails.forEach(this.handleDiscordNotification.bind(this));
    this.fetchMailService.disconnect();
  }

  private async handleDiscordNotification(mail: MailType) {
    const notification = `📧 from: ${mail.from.address}, ${mail.from.name}\n📢 subject: ${mail.subject}\n📝 message: ${mail.text}`;

    await this.discordService.sendMessage(
      discordConfig.channel_focused,
      notification
    );
  }

  private async handleOnNothingMailsFounded() {
    this.fetchMailService.disconnect();
  }

  private async handleWatchMails() {
    (await this.fetchMailService.connect()).openBox('INBOX');
  }
}
