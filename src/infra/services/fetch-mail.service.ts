import { ImapSimpleOptions } from 'imap-simple';
import imaps from 'imap-simple';
import { FetchOptions } from 'imap';
import { ParsedMail, simpleParser } from 'mailparser';
import EventEmitter from 'events';
import { DecodedService } from '../util/decode.service';

export type MailType = {
  from: {
    address: string;
    name: string;
  };
  subject: string;
  text: string;
};

export type FetchMailEvents = 'finish-read-messages' | 'nothing-email-founded';

export class FetchMailService extends EventEmitter {
  private imap: typeof imaps;
  private connectionImap: imaps.ImapSimple | null;
  private mails: MailType[] = [];

  constructor(
    private readonly imapConfig: ImapSimpleOptions,
    private readonly decodedService: DecodedService,
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

  disconnect() {
    this.connectionImap?.end();
  }

  async openBox(boxName: string) {
    if (!this.connectionImap) {
      throw new Error('Connection not established');
    }

    this.connectionImap?.openBox(boxName, this.handleOpenBox.bind(this));
  }

  private async handleSearchBox(err: Error | null, messages: imaps.Message[]) {
    if (err) {
      throw err;
    } else {
      const messagesCounts = {
        totalMessages: messages.length,
        currentMessage: 0
      };

      if (messages.length > 0) {
        messages.forEach((item) => {
          const id = item.attributes.uid;
          const all = item.parts.find((part) => part.which === '');
          const idHeader = `Imap-Id: ${id}\r\n`;

          const bodyParsed = this.decodedService.quotePrintableToUF8(all?.body);

          const textMatch = bodyParsed.match(
            /Content-Transfer-Encoding: quoted-printable(.+)------=_Part_/s
          );

          const text = textMatch?.[1].replace(/^[\r\n/]+/, '');

          simpleParser(idHeader + all?.body, (err, mail) =>
            this.handleParseMail(err, { ...mail, text }, id, messagesCounts)
          );
        });
      } else {
        this.emit('nothing-email-founded');
      }
    }
  }

  private async handleParseMail(
    err: Error | null,
    mail: ParsedMail,
    id: number,
    messagesCounts: {
      currentMessage: number;
      totalMessages: number;
    }
  ) {
    if (err) {
      throw err;
    } else {
      const address = mail?.from?.value[0]?.address || '';
      const name = mail?.from?.value[0]?.name || '';
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

      messagesCounts.currentMessage++;

      if (messagesCounts.currentMessage == messagesCounts.totalMessages) {
        this.emit('finish-read-messages', this.mails);
      }
    }
  }

  private async handleAddFlags(err: Error | null) {
    if (err) {
      throw err;
    }
  }

  private async handleOpenBox(err: Error | null, boxName: string) {
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
