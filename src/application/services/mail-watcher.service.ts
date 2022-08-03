import {
  FetchMailService,
  MailType
} from '../../infra/services/fetch-mail.service';

export class MailWatcherService {
  constructor(private readonly fetchMailService: FetchMailService) {}

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
    this.fetchMailService.disconnect();
  }

  private async handleOnNothingMailsFounded() {
    this.fetchMailService.disconnect();
  }

  private async handleWatchMails() {
    (await this.fetchMailService.connect()).openBox('INBOX');
  }
}
