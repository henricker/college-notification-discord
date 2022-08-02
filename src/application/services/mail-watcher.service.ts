import {
  FetchMailService,
  MailType
} from '../../infra/services/fetch-mail.service';

export class MailWatcherService {
  constructor(private readonly fetchMailService: FetchMailService) {
    this.fetchMailService.on(
      'finish-read-messages',
      this.handleOnFinishReadMailsFounded.bind(this)
    );

    this.fetchMailService.on('nothing-email-founded', async () => {
      console.info('Nothing mails found');
      await this.fetchMailService.disconnect();
    });
  }
  async watch(interval: number) {
    console.info('Initializing mail watcher');
    setInterval(this.handleWatchMails.bind(this), interval);
  }

  private async handleOnFinishReadMailsFounded(mails: MailType[]) {
    console.info('New mails found');
    console.log(mails);
    await this.fetchMailService.disconnect();
  }

  private async handleWatchMails() {
    try {
      (await this.fetchMailService.connect())?.openBox('INBOX');
    } catch (err) {
      console.error(err);
    }
  }
}
