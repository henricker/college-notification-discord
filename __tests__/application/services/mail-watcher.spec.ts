import { Client as DiscordClient } from 'discord.js';
import { MailWatcherService } from '../../../src/application/services/mail-watcher.service';
import { DiscordService } from '../../../src/infra/services/discord.service';
import { FetchMailService } from '../../../src/infra/services/fetch-mail.service';

const imapConfigMock = {
  imap: {
    user: 'test',
    password: 'test',
    host: 'test'
  }
};

function generateStubMailWatcher() {
  const discordServiceStub = new DiscordService({} as DiscordClient);
  const mailWatcher = new MailWatcherService(
    new FetchMailService(imapConfigMock),
    discordServiceStub
  );
  return {
    mailWatcher
  };
}

describe('# Mail Watcher (service)', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('listenEvents (method)', () => {
    it('Should call on method with correct events', () => {
      const { mailWatcher } = generateStubMailWatcher();

      const spyOn = jest.spyOn(mailWatcher['fetchMailService'] as any, 'on');

      mailWatcher.listenEvents();

      expect(spyOn).toHaveBeenCalledTimes(2);

      const firstCall = spyOn.mock.calls[0];
      const secondCall = spyOn.mock.calls[1];

      expect(firstCall[0]).toBe('finish-read-messages');
      const firstCallCallback = firstCall[1] as Function;
      expect(firstCallCallback.name).toBe(
        mailWatcher['handleOnFinishReadMailsFounded'].bind(mailWatcher).name
      );

      expect(secondCall[0]).toBe('nothing-email-founded');
      const secondCallCallback = secondCall[1] as Function;
      expect(secondCallCallback.name).toBe(
        mailWatcher['handleOnNothingMailsFounded'].bind(mailWatcher).name
      );
    });

    it('Should return itself instance on success', () => {
      const { mailWatcher } = generateStubMailWatcher();
      const result = mailWatcher.listenEvents();
      expect(result).toBe(mailWatcher);
    });

    it('Should throw if on method throws of fetchMailService throws', () => {
      const { mailWatcher } = generateStubMailWatcher();
      const spyOn = jest.spyOn(mailWatcher['fetchMailService'] as any, 'on');
      spyOn.mockImplementation(() => {
        throw new Error('test');
      });
      expect(() => mailWatcher.listenEvents()).toThrow();
    });
  });

  describe('watch (method)', () => {
    it('Should call setInterval with correct arguments', async () => {
      const setInvervalSpy = jest
        .spyOn(global, 'setInterval')
        .mockImplementation((cb, ms) => {
          return {} as NodeJS.Timer;
        });

      const { mailWatcher } = generateStubMailWatcher();
      await mailWatcher.watch(5000);
      expect(setInvervalSpy).toHaveBeenCalledTimes(1);

      const calls = setInvervalSpy.mock.calls[0];

      const firstArg = calls[0];
      const secondArg = calls[1];

      expect(firstArg.name).toBe(
        mailWatcher['handleWatchMails'].bind(mailWatcher).name
      );

      expect(secondArg).toBe(5000);

      setInvervalSpy.mockRestore();
    });

    it('Should throw if setInterval throws', async () => {
      const setInvervalSpy = jest
        .spyOn(global, 'setInterval')
        .mockImplementation((cb, ms) => {
          throw new Error('test');
        });

      const { mailWatcher } = generateStubMailWatcher();
      expect(mailWatcher.watch).rejects.toThrowError();
      setInvervalSpy.mockRestore();
    });
  });

  describe('handleOnNothingMailsFounded (method)', () => {
    it('Should call disconnect method on fetchMailService', () => {
      const { mailWatcher } = generateStubMailWatcher();

      const disconnectSpy = jest.spyOn(
        mailWatcher['fetchMailService'] as any,
        'disconnect'
      );

      mailWatcher['handleOnNothingMailsFounded']();

      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('Should throw if disconnect method on fetchMailService throws', () => {
      const { mailWatcher } = generateStubMailWatcher();

      jest
        .spyOn(mailWatcher['fetchMailService'] as any, 'disconnect')
        .mockImplementationOnce(() => {
          throw new Error('test');
        });

      expect(
        mailWatcher['handleOnNothingMailsFounded']()
      ).rejects.toThrowError();
    });
  });

  describe('handleOnFinishReadMailsFounded (method)', () => {
    it('Should call disconnect method on fetchMailService', () => {
      const { mailWatcher } = generateStubMailWatcher();

      const disconnectSpy = jest.spyOn(
        mailWatcher['fetchMailService'] as any,
        'disconnect'
      );

      mailWatcher['handleOnFinishReadMailsFounded']([]);

      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('Should throw if disconnect method on fetchMailService throws', () => {
      const { mailWatcher } = generateStubMailWatcher();

      jest
        .spyOn(mailWatcher['fetchMailService'] as any, 'disconnect')
        .mockImplementationOnce(() => {
          throw new Error('test');
        });

      expect(
        mailWatcher['handleOnFinishReadMailsFounded']([])
      ).rejects.toThrowError();
    });
  });

  describe('handleWatchMails (method)', () => {
    const { mailWatcher } = generateStubMailWatcher();

    it('Should call connect method of fetchMailService', async () => {
      const connectSpy = jest
        .spyOn(mailWatcher['fetchMailService'] as any, 'connect')
        .mockImplementationOnce(() => {
          return mailWatcher['fetchMailService'];
        });

      jest
        .spyOn(mailWatcher['fetchMailService'] as any, 'openBox')
        .mockImplementationOnce(() => {});

      await mailWatcher['handleWatchMails']();

      expect(connectSpy).toHaveBeenCalled();
    });

    it('Should call openBox of fetchMailService with correct params', async () => {
      jest
        .spyOn(mailWatcher['fetchMailService'] as any, 'connect')
        .mockImplementationOnce(() => {
          return mailWatcher['fetchMailService'];
        });

      const openBoxSpy = jest
        .spyOn(mailWatcher['fetchMailService'] as any, 'openBox')
        .mockImplementationOnce(() => {});

      await mailWatcher['handleWatchMails']();

      expect(openBoxSpy).toHaveBeenCalledWith('INBOX');
    });
  });

  describe('handleDiscordNotification (method)', () => {
    it('Should call sendMessage method of discordService', async () => {
      const { mailWatcher } = generateStubMailWatcher();

      const sendMessageSpy = jest
        .spyOn(mailWatcher['discordService'] as any, 'sendMessage')
        .mockImplementationOnce(() => {});

      await mailWatcher['handleDiscordNotification']({
        from: {
          address: 'mail',
          name: 'name'
        },
        subject: 'subject',
        text: 'text'
      });

      expect(sendMessageSpy).toHaveBeenCalled();
    });

    it('Should throw if sendMessage method of discordService throws', async () => {
      const { mailWatcher } = generateStubMailWatcher();

      jest
        .spyOn(mailWatcher['discordService'] as any, 'sendMessage')
        .mockImplementationOnce(() => {
          throw new Error('test');
        });

      expect(
        mailWatcher['handleDiscordNotification']({
          from: {
            address: 'mail',
            name: 'name'
          },
          subject: 'subject',
          text: 'text'
        })
      ).rejects.toThrowError();
    });
  });
});
