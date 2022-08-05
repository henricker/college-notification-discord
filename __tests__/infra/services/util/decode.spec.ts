import { DecodedService } from '../../../../src/infra/util/decode.service';
import quotedPrintable from 'quoted-printable';

jest.mock('quoted-printable', () => {
  return {
    decode: jest.fn(() => 'decoded')
  };
});

function generateDecodedService(): DecodedService {
  return new DecodedService();
}

describe('Decode (service-util)', () => {
  describe('quotePrintableToUF8', () => {
    it('Should call decode method of lib with correct params', async () => {
      const service = generateDecodedService();
      const data = 'data';
      service.quotePrintableToUF8(data);
      expect(quotedPrintable.decode).toHaveBeenCalledWith(data);
    });

    it('Should throw if decode method of lib throws', () => {
      const service = generateDecodedService();
      const data = 'data';
      quotedPrintable.decode = jest.fn(() => {
        throw new Error('decode error');
      });
      expect(() => service.quotePrintableToUF8(data)).toThrowError(
        'decode error'
      );
    });
  });
});
