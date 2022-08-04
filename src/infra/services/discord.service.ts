import { Client as ClientDiscord } from 'discord.js';
import { discordConfig } from '../config/discord';

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
    ) as any;

    if (!channel) {
      throw new Error('Channel not found');
    }

    await channel.send(message);
  }
}
