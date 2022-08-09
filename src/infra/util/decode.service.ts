import { convert } from 'html-to-text';

import {
  MailParserOptions,
  ParsedMail,
  simpleParser,
  Source
} from 'mailparser';

export class DecodedService {
  private convert: typeof convert;
  private simpleParser: typeof simpleParser;
  constructor() {
    this.convert = convert;
    this.simpleParser = simpleParser;
  }
  removeHtml(data: string) {
    return this.convert(data);
  }

  async parserEmail(
    source: Source,
    options?: MailParserOptions | undefined
  ): Promise<ParsedMail> {
    return this.simpleParser(source, options);
  }
}
