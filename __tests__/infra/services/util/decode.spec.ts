import { DecodedService } from '../../../../src/infra/util/decode.service';

function generateDecodedService(): DecodedService {
  return new DecodedService();
}

describe('Decode (service-util)', () => {
  describe('parseMail (method)', () => {
    it('Should call simpleParser with correct params', () => {
      const service = generateDecodedService();
      const spy = jest
        .spyOn(service, 'simpleParser' as any)
        .mockImplementationOnce(() => {});
      const source = 'string';
      const options = {};
      service.parserEmail('string', options);
      expect(spy).toHaveBeenCalledWith(source, options);
    });

    it('Should throw if simpleParser throws', () => {
      const service = generateDecodedService();
      jest.spyOn(service, 'simpleParser' as any).mockImplementationOnce(() => {
        throw new Error('Error');
      });
      const source = 'string';
      const options = {};

      expect(service.parserEmail(source, options)).rejects.toThrow();
    });
  });

  describe('removeHtml (method)', () => {
    it('Should call convert method of html-to-text with correct params', () => {
      const service = generateDecodedService();
      const data = '<p>Hello World</p>';
      const spy = jest
        .spyOn(service, 'convert' as any)
        .mockImplementationOnce(() => 'Hello World');
      service.removeHtml(data);

      expect(spy).toHaveBeenCalledWith(data);
    });

    it('Should throw if convert throws', () => {
      const service = generateDecodedService();
      const data = '<p>Hello World</p>';
      jest.spyOn(service, 'convert' as any).mockImplementationOnce(() => {
        throw new Error('error');
      });

      try {
        service.removeHtml(data);
      } catch (err) {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(Error);
      }
    });
  });
});
