import { convert } from 'html-to-text';

import {
  MailParserOptions,
  ParsedMail,
  simpleParser,
  Source
} from 'mailparser';

export class DecodedService {
  removeHtml(data: string) {
    return convert(data);
  }

  async parserEmail(
    source: Source,
    options?: MailParserOptions | undefined
  ): Promise<ParsedMail> {
    return simpleParser(source, options);
  }
}
