import { Client as ClientDiscord, TextChannel } from 'discord.js';
import { discordConfig } from '../config/discord';
import { CONSTANTS } from '../config/constants';

export class DiscordService {
  constructor(private readonly discord: ClientDiscord) {}

  public async connect() {
    this.listenEvents();
    await this.discord.login(discordConfig.token);
  }

  private async listenEvents() {
    this.discord.on('ready', this.onReadyConnect);
  }

  private async onReadyConnect() {
    console.log('Discord ready!');
  }

  public async sendMessage(
    channelName: string,
    message: string
  ): Promise<void> {
    const channel = this.discord.channels.cache.find(
      (channel: any) => channel.toJSON().name === channelName
    ) as TextChannel;

    if (!channel) {
      throw new Error('Channel not found');
    }

    const messageToSend =
      message.length > CONSTANTS.MESSAGE_LENGTH_LIMIT_DISCORD
        ? {
            files: [
              {
                name: 'notification.txt',
                attachment: Buffer.from(message)
              }
            ]
          }
        : message;

    await channel.send(messageToSend);
  }
}
