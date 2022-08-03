import { Client as ClientDiscord } from 'discord.js';

export class DiscordService {
  constructor(private readonly discord: ClientDiscord) {}

  public async connect() {
    this.listenEvents();
    await this.discord.login(process.env.DISCORD_TOKEN);
  }

  private async listenEvents() {
    this.discord.on('ready', () => console.log('Discord ready!'));
  }

  public async sendMessage(
    channelName: string,
    message: string
  ): Promise<void> {
    const channel = this.discord.channels.cache.find((channel) => {
      const channelJSON = channel.toJSON() as any;
      return channelJSON.name === channelName;
    }) as any;

    if (!channel) {
      throw new Error('Channel not found');
    }

    await channel.send(message);
  }
}
