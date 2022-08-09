import { ImapSimpleOptions } from 'imap-simple';
import imaps from 'imap-simple';
import { FetchOptions } from 'imap';
import { ParsedMail, simpleParser } from 'mailparser';
import EventEmitter from 'events';
import { DecodedService } from '../util/decode.service';
import { CONSTANTS } from '../config/constants';

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

      if (messages.length === 0) {
        this.emit(CONSTANTS.EVENTS.NOTHING_EMAIL_FOUNDED);
        return;
      }

      for await (const item of messages) {
        const id = item.attributes.uid;
        const all = item.parts.find((part) => part.which === '');
        const idHeader = `Imap-Id: ${id}\r\n`;

        try {
          const mail = await this.decodedService.parserEmail(
            idHeader + all?.body,
            {
              encoding: 'utf8'
            }
          );

          if (!mail?.text && mail?.html) {
            mail.text = this.decodedService.removeHtml(mail.html);
          }

          this.handleParseMail(null, mail, id, messagesCounts);
        } catch (err: any) {
          throw err;
        }
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
    const yesterday = new Date();
    yesterday.setTime(Date.now() - CONSTANTS.FETCH_MAILS_FROM_LAST_HOURS);

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
