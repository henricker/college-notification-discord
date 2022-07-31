import Imap from 'imap';

export class MailListenerService {
  constructor(private readonly imap: Imap) {}

  private handleOnError() {
    this.imap.on('error', (error: Error) => {
      console.error(error);
    });
  }

  private handleOnEnd() {
    this.imap.on('end', () => {
      console.log('Connection ended');
    });
  }
}
