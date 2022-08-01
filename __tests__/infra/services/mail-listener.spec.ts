import { FetchMailService } from '../../../src/infra/services/mail-listener.service';

const imapConfigMock = {
  imap: {
    user: 'test',
    password: 'test',
    host: 'test'
  }
};
const fetchMailService = new FetchMailService(imapConfigMock);

jest.mock('imap-simple', () => {
  return {
    connect: jest.fn((config) => {
      return {
        openBox: jest.fn((boxName, cb) => {}),
        addFlags: jest.fn((id, flags, cb) => {}),
        search: jest.fn((searchCriteria, fetchOptions, cb) => {})
      };
    })
  };
});

describe('# Fetch Mail (service)', () => {
  describe('connect (method)', () => {
    it('Should call connect method by imap with correct values when connect method of fetch mail has called', () => {
      const connectSpy = jest.spyOn(fetchMailService['imap'], 'connect');
      fetchMailService.connect();
      expect(connectSpy).toHaveBeenCalledWith(imapConfigMock);
    });

    it('Should throw if connect method of imap throws', () => {
      const connectSpy = jest.spyOn(fetchMailService['imap'], 'connect');
      connectSpy.mockImplementationOnce(() => {
        throw new Error('Error');
      });
      fetchMailService.connect().catch((err) => {
        expect(err).toBeInstanceOf(Error);
      });
    });

    it('Should return itself instance on success connection', () => {
      jest.spyOn(fetchMailService['imap'], 'connect');
      expect(fetchMailService.connect()).resolves.toBe(fetchMailService);
    });
  });
});
