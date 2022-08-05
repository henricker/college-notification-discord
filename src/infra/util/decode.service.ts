import quotedPrintable from 'quoted-printable';

export class DecodedService {
  public quotePrintableToUF8(data: string): string {
    return quotedPrintable.decode(data);
  }
}
