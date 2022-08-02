import { FetchMailService } from '../../../src/infra/services/fetch-mail.service';
import { ParsedMail, Source } from 'mailparser';
import { Message } from 'imap-simple';

const imapConfigMock = {
  imap: {
    user: 'test',
    password: 'test',
    host: 'test'
  }
};

function generateServiceStub() {
  const fetchMailService = new FetchMailService(imapConfigMock);
  return {
    fetchMailService
  };
}

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

jest.mock('mailparser', () => {
  return {
    simpleParser: jest.fn(
      (
        source: Source,
        callback: (error: Error | null, mail: ParsedMail) => void
      ) => {}
    )
  };
});

describe('# Fetch Mail (service)', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('connect (method)', () => {
    it('Should call connect method by imap with correct values when connect method of fetch mail has called', () => {
      const { fetchMailService } = generateServiceStub();
      const connectSpy = jest.spyOn(fetchMailService['imap'], 'connect');
      fetchMailService.connect();
      expect(connectSpy).toHaveBeenCalledWith(imapConfigMock);
    });

    it('Should throw if connect method of imap throws', () => {
      const { fetchMailService } = generateServiceStub();
      const connectSpy = jest.spyOn(fetchMailService['imap'], 'connect');
      connectSpy.mockImplementationOnce(() => {
        throw new Error('Error');
      });
      fetchMailService.connect().catch((err) => {
        expect(err).toBeInstanceOf(Error);
      });
    });

    it('Should return itself instance on success connection', () => {
      const { fetchMailService } = generateServiceStub();
      jest.spyOn(fetchMailService['imap'], 'connect');
      expect(fetchMailService.connect()).resolves.toBe(fetchMailService);
    });
  });

  describe('openBox (method)', () => {
    it('Should throw if connection with imap not stablished', () => {
      const { fetchMailService } = generateServiceStub();
      fetchMailService['connectionImap'] = null;
      expect(fetchMailService.openBox('INBOX')).rejects.toThrow();
    });

    it('Should call openBox method of imap with correct values when openBox method of fetch mail has called', async () => {
      const { fetchMailService } = generateServiceStub();
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
      const { fetchMailService } = generateServiceStub();
      expect(
        fetchMailService['handleOpenBox'](new Error('Error'), 'INBOX')
      ).rejects.toThrow();
    });

    it('Should call search method of imap with correct values if all right', async () => {
      const { fetchMailService } = generateServiceStub();
      await fetchMailService.connect();

      const searchSpy = jest.spyOn(
        fetchMailService['connectionImap'] as any,
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

      fetchMailService['handleOpenBox'](null, 'INBOX');

      const firstArgument = searchSpy.mock.calls[0][0];
      const secondArgument = searchSpy.mock.calls[0][1];
      const thirdArgument = (searchSpy.mock.calls[0][2] as Function).name;

      expect(firstArgument).toEqual(testCriteria);
      expect(secondArgument).toEqual(testFetchOpttions);
      expect(thirdArgument).toBe(
        fetchMailService['handleSearchBox'].bind(fetchMailService).name
      );
      jest.useRealTimers();
    });
  });

  describe('handleAddFlags (method)', () => {
    it('Should throw an error if error has been passed', () => {
      const { fetchMailService } = generateServiceStub();
      expect(
        fetchMailService['handleAddFlags'](new Error('Error'))
      ).rejects.toThrow();
    });

    it('Should not throw if no error has been passed', () => {
      const { fetchMailService } = generateServiceStub();
      expect(fetchMailService['handleAddFlags'](null)).resolves.not.toThrow();
    });
  });

  describe('handleSearchBox (method)', () => {
    it('Should throw if error has been passed to function', () => {
      const { fetchMailService } = generateServiceStub();
      expect(
        fetchMailService['handleSearchBox'](new Error('Error'), [])
      ).rejects.toThrow();
    });

    it('Should call simple parser to get infos by email tree times to tree messages with correct values', async () => {
      const { fetchMailService } = generateServiceStub();

      const messages: Message[] = [
        {
          attributes: {
            uid: 1,
            date: new Date(),
            flags: ['\\Unseen'],
            size: 0
          },
          parts: [{ body: '', which: '', size: 1 }],
          seqno: 1
        },
        {
          attributes: {
            uid: 1,
            date: new Date(),
            flags: ['\\Unseen'],
            size: 0
          },
          parts: [{ body: '', which: '', size: 1 }],
          seqno: 1
        },
        {
          attributes: {
            uid: 1,
            date: new Date(),
            flags: ['\\Unseen'],
            size: 0
          },
          parts: [{ body: '', which: '', size: 1 }],
          seqno: 1
        }
      ];

      const simpleParserMock = (await import('mailparser')).simpleParser;
      fetchMailService['handleSearchBox'](null, messages);
      expect(simpleParserMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('handleParseMail (method)', () => {
    it('Should throw error if simple parser callback throws', async () => {
      const { fetchMailService } = generateServiceStub();

      const mockMessage = {
        attributes: {
          uid: 1,
          date: new Date(),
          flags: ['\\Unseen'],
          size: 0
        },
        parts: [{ body: '', which: '', size: 1 }],
        seqno: 1
      };

      expect(
        fetchMailService['handleParseMail'](
          new Error('Error'),
          null as any,
          null as any,
          null as any
        )
      ).rejects.toThrowError();
    });

    it('Should callback of simpleParser calls addFlags method of connection imap with correct data', async () => {
      const { fetchMailService } = generateServiceStub();
      await fetchMailService.connect();

      const mockMail: ParsedMail = {
        text: 'message test',
        subject: 'test',
        from: {
          value: [
            {
              name: 'Henrique Vieira',
              address: 'henriquevieira@alu.ufc.br'
            }
          ],
          html: '<h1>Henrique Vieira</h1>',
          text: 'Henrique Vieira'
        },
        attachments: [],
        headerLines: [],
        headers: new Map(),
        html: '<h1>Henrique Vieira</h1>'
      };

      const addFlagsSpy = jest.spyOn(
        fetchMailService['connectionImap'] as any,
        'addFlags'
      );

      await fetchMailService['handleParseMail'](null, mockMail, 1, {
        currentMessage: 0,
        totalMessages: 1
      });

      const firstArg = addFlagsSpy.mock.calls[0][0];
      const secondArg = addFlagsSpy.mock.calls[0][1];
      const thirdArg = (addFlagsSpy.mock.calls[0][2] as Function).name;

      expect(firstArg).toEqual(1);
      expect(secondArg).toEqual('\\Seen');
      expect(thirdArg).toBe(
        fetchMailService['handleAddFlags'].bind(fetchMailService).name
      );
    });

    it("Should call emit method with event 'finish-read-messages' and an array of emails if all right to parse", async () => {
      const { fetchMailService } = generateServiceStub();
      await fetchMailService.connect();

      const mockMail: ParsedMail = {
        text: 'message test',
        subject: 'test',
        from: {
          value: [
            {
              name: 'Henrique Vieira',
              address: 'henriquevieira@alu.ufc.br'
            }
          ],
          html: '<h1>Henrique Vieira</h1>',
          text: 'Henrique Vieira'
        },
        attachments: [],
        headerLines: [],
        headers: new Map(),
        html: '<h1>Henrique Vieira</h1>'
      };

      const emitSpy = jest.spyOn(fetchMailService, 'emit');

      await fetchMailService['handleParseMail'](null, mockMail, 1, {
        currentMessage: 0,
        totalMessages: 1
      });

      expect(emitSpy).toBeCalledWith('finish-read-messages', [
        {
          from: {
            address: 'henriquevieira@alu.ufc.br',
            name: 'Henrique Vieira'
          },
          subject: 'test',
          text: 'message test'
        }
      ]);
    });
  });
});
