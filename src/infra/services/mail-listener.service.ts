import { ImapSimpleOptions } from 'imap-simple';
import imaps from 'imap-simple';
import { FetchOptions } from 'imap';
import { simpleParser } from 'mailparser';
import EventEmitter from 'events';

export type MailType = {
  from: {
    address: string;
    name: string;
  };
  subject: string;
  text: string;
};

export type FetchMailEvents = 'finish-read-messages';

export class FetchMailService extends EventEmitter {
  private imap: typeof imaps;
  private connectionImap: imaps.ImapSimple | null;
  private mails: MailType[] = [];

  constructor(
    private readonly imapConfig: ImapSimpleOptions,
    eventEmitterOptions?: {
      captureRejections?: boolean | undefined;
    }
  ) {
    super(eventEmitterOptions);
    this.imap = imaps;
    this.connectionImap = null;
  }

  async connect() {
    const connection = await this.imap.connect(this.imapConfig);
    this.connectionImap = connection;
    return this;
  }

  async openBox(boxName: string) {
    if (!this.connectionImap) {
      throw new Error('Connection not established');
    }

    this.connectionImap?.openBox(boxName, this.handleOpenBox.bind(this));
  }

  private async handleSearchBox(err: Error, messages: imaps.Message[]) {
    if (err) {
      console.error(err);
    } else {
      const totalMessages = messages.length;
      let currentMessage = 0;
      messages.forEach((item) => {
        const id = item.attributes.uid;
        const all = item.parts.find((part) => part.which === '');
        const idHeader = `Imap-Id: ${id}\r\n`;

        simpleParser(idHeader + all?.body, (err, mail) => {
          if (err) {
            throw err;
          } else {
            const address = mail.from?.value[0]?.address || '';
            const name = mail.from?.value[0]?.name || '';
            const subject = mail?.subject || '';
            const body = mail?.text || '';

            this.connectionImap?.addFlags(
              id,
              '\\Seen',
              this.handleAddFlags.bind(this)
            );

            this.mails.push({
              from: {
                address,
                name
              },
              subject,
              text: body
            });

            currentMessage++;

            if (currentMessage == totalMessages) {
              this.emit('finish-read-messages', this.mails);
            }
          }
        });
      });
    }
  }

  private async handleAddFlags(err: Error) {
    if (err) {
      throw err;
    }

    console.log('Marker as seen');
  }

  private async handleOpenBox(err: Error, boxName: string) {
    if (err) {
      throw err;
    }
    const delay = 24 * 3600 * 1000;
    const yesterday = new Date();
    yesterday.setTime(Date.now() - delay);

    const searchCriteria = ['UNSEEN', ['SINCE', yesterday]];
    const fetchOptions: FetchOptions = {
      bodies: ['HEADER', 'TEXT', '']
    };

    this.connectionImap?.search(
      searchCriteria,
      fetchOptions,
      this.handleSearchBox.bind(this)
    );
  }
}
