import { FetchMailService } from '../../../src/infra/services/mail-listener.service';

const imapConfigMock = {
  imap: {
    user: 'test',
    password: 'test',
    host: 'test'
  }
};

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
      const fetchMailService = new FetchMailService(imapConfigMock);
      const connectSpy = jest.spyOn(fetchMailService['imap'], 'connect');
      fetchMailService.connect();
      expect(connectSpy).toHaveBeenCalledWith(imapConfigMock);
    });

    it('Should throw if connect method of imap throws', () => {
      const fetchMailService = new FetchMailService(imapConfigMock);
      const connectSpy = jest.spyOn(fetchMailService['imap'], 'connect');
      connectSpy.mockImplementationOnce(() => {
        throw new Error('Error');
      });
      fetchMailService.connect().catch((err) => {
        expect(err).toBeInstanceOf(Error);
      });
    });

    it('Should return itself instance on success connection', () => {
      const fetchMailService = new FetchMailService(imapConfigMock);
      jest.spyOn(fetchMailService['imap'], 'connect');
      expect(fetchMailService.connect()).resolves.toBe(fetchMailService);
    });
  });

  describe('openBox (method)', () => {
    it('Should throw if connection with imap not stablished', () => {
      const fetchMailService = new FetchMailService(imapConfigMock);
      fetchMailService['connectionImap'] = null;
      expect(fetchMailService.openBox('INBOX')).rejects.toThrow();
    });

    it('Should call openBox method of imap with correct values when openBox method of fetch mail has called', async () => {
      const fetchMailService = new FetchMailService(imapConfigMock);
      await fetchMailService.connect();

      const openBoxSpy = jest.spyOn(
        fetchMailService['connectionImap'] as any,
        'openBox'
      );
      fetchMailService.openBox('INBOX');

      expect(openBoxSpy.mock.calls[0][0]).toBe('INBOX');
      expect((openBoxSpy.mock.calls[0][1] as Function).name).toBe(
        fetchMailService['handleOpenBox'].bind(fetchMailService).name
      );
    });
  });

  describe('handleOpenBox (method)', () => {
    it('Should throw if error has been passed', () => {
      const fetchMailService = new FetchMailService(imapConfigMock);
      expect(
        fetchMailService['handleOpenBox'](new Error('Error'), 'INBOX')
      ).rejects.toThrow();
    });

    it('Should call search method of imap with correct values if all right', async () => {
      const fetchMailservice = new FetchMailService(imapConfigMock);
      await fetchMailservice.connect();

      const searchSpy = jest.spyOn(
        fetchMailservice['connectionImap'] as any,
        'search'
      );
      jest.useFakeTimers().setSystemTime(new Date('2022-04-17'));
      const delay = 24 * 3600 * 1000;
      const yesterday = new Date();
      yesterday.setTime(Date.now() - delay);

      const testCriteria = ['UNSEEN', ['SINCE', yesterday]];
      const testFetchOpttions = {
        bodies: ['HEADER', 'TEXT', '']
      };

      fetchMailservice['handleOpenBox'](null, 'INBOX');

      const firstArgument = searchSpy.mock.calls[0][0];
      const secondArgument = searchSpy.mock.calls[0][1];
      const thirdArgument = (searchSpy.mock.calls[0][2] as Function).name;

      expect(firstArgument).toEqual(testCriteria);
      expect(secondArgument).toEqual(testFetchOpttions);
      expect(thirdArgument).toBe(
        fetchMailservice['handleSearchBox'].bind(fetchMailservice).name
      );
      jest.useRealTimers();
    });
  });
});
