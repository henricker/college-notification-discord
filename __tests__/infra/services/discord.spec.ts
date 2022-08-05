import { Client as DiscordClient } from 'discord.js';

import { DiscordService } from '../../../src/infra/services/discord.service';

const generateRandomString = (myLength: number) => {
  const chars =
    'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
  const randomArray = Array.from(
    { length: myLength },
    (v, k) => chars[Math.floor(Math.random() * chars.length)]
  );

  const randomString = randomArray.join('');
  return randomString;
};

function generateDiscordStub() {
  const clientDiscordStub = {
    login: jest.fn(),
    on: jest.fn(),
    channels: {
      cache: {
        find: jest.fn(() => ({
          send: jest.fn(() => {})
        }))
      }
    }
  } as unknown as DiscordClient;
  const discordService = new DiscordService(clientDiscordStub);

  return {
    discordService,
    clientDiscordStub
  };
}

describe('# Discord (service)', () => {
  describe('connect (method)', () => {
    it('Should call login method of discord client', () => {
      const { discordService, clientDiscordStub } = generateDiscordStub();
      discordService.connect();

      expect(clientDiscordStub.login).toHaveBeenCalledTimes(1);
    });

    it('Should throw an error if login fails', async () => {
      const { discordService, clientDiscordStub } = generateDiscordStub();
      clientDiscordStub.login = jest
        .fn(() => {
          throw new Error('Login failed');
        })
        .mockName('login');

      await expect(discordService.connect()).rejects.toThrow('Login failed');
    });

    it('Should call listenEvents of itself', () => {
      const { discordService } = generateDiscordStub();
      const spyOn = jest.spyOn(discordService, 'listenEvents' as any);
      discordService.connect();

      expect(spyOn).toHaveBeenCalledTimes(1);
    });
  });

  describe('listenEvents (method)', () => {
    it('Should call on method of discord client', () => {
      const { discordService } = generateDiscordStub();
      const spyOn = jest.spyOn(discordService['discord'] as any, 'on');

      discordService['listenEvents']();

      const firstArg = spyOn.mock.calls[0][0];
      const secondArg = spyOn.mock.calls[0][1] as Function;
      expect(spyOn).toHaveBeenCalledTimes(1);
      expect(firstArg).toBe('ready');
      expect(secondArg.toString()).toBe(
        discordService['onReadyConnect'].toString()
      );
    });

    it('Should throw an error if on method fails', () => {
      const { discordService, clientDiscordStub } = generateDiscordStub();
      clientDiscordStub.on = jest
        .fn(() => {
          throw new Error('On failed');
        })
        .mockName('on');
      expect(discordService['listenEvents']()).rejects.toThrow('On failed');
    });
  });

  describe('onReadyConnect (method)', () => {
    it('Should call console.log with correct message', () => {
      const { discordService } = generateDiscordStub();
      const spyOn = jest.spyOn(console, 'log');
      discordService['onReadyConnect']();

      expect(spyOn).toHaveBeenCalledTimes(1);
      expect(spyOn).toHaveBeenCalledWith('Discord ready!');
    });
  });

  describe('sendMessage (method)', () => {
    it('Should call find method to search channel', () => {
      const { discordService } = generateDiscordStub();
      const spyOn = jest.spyOn(
        discordService['discord'].channels.cache,
        'find'
      );
      discordService['sendMessage']('channelName', 'message');

      expect(spyOn).toHaveBeenCalledTimes(1);
    });

    it('Should throw an error if find method fails', () => {
      const { discordService } = generateDiscordStub();
      discordService['discord'].channels.cache.find = jest
        .fn(() => {
          throw new Error('Find failed');
        })
        .mockName('find');
      expect(
        discordService['sendMessage']('channelName', 'message')
      ).rejects.toThrow('Find failed');
    });

    it('Should call callback inside find method of channel search', () => {
      const { discordService } = generateDiscordStub();
      const findSpy = jest.spyOn(
        discordService['discord'].channels.cache,
        'find'
      );
      discordService['sendMessage']('channelName', 'message');

      const callback = findSpy.mock.calls[0][0] as any;

      expect(callback).toBeInstanceOf(Function);

      callback({
        toJSON: () => ({ name: 'channelName' })
      });
    });

    it('Should throw an error if channel does not exists', () => {
      const { discordService, clientDiscordStub } = generateDiscordStub();
      clientDiscordStub.channels.cache.find = jest.fn(() => undefined);

      expect(
        discordService['sendMessage']('channelName', 'message')
      ).rejects.toThrow('Channel not found');
    });

    it('Should call send method of channel with message if message ha length less than 2000', () => {
      const { discordService, clientDiscordStub } = generateDiscordStub();

      const channel = {
        send: jest.fn(() => {})
      };

      clientDiscordStub.channels.cache.find = jest.fn(() => channel) as any;

      const sendSpy = jest.spyOn(channel, 'send');

      discordService['sendMessage']('channelName', 'message');

      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy).toHaveBeenCalledWith('message');
    });

    it('Should call with attachment file if message has too long', () => {
      const { discordService, clientDiscordStub } = generateDiscordStub();

      const channel = {
        send: jest.fn(() => {})
      };

      clientDiscordStub.channels.cache.find = jest.fn(() => channel) as any;

      const sendSpy = jest.spyOn(channel, 'send');

      discordService['sendMessage']('channelName', generateRandomString(2001));

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          files: expect.arrayContaining([
            expect.objectContaining({
              name: 'notification.txt'
            })
          ])
        })
      );
    });
  });
});
