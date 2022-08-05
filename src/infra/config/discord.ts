export const discordConfig = {
  application_id: process.env.DISCORD_APPLICATION_ID ?? '',
  public_key: process.env.DISCORD_PUBLIC_KEY ?? '',
  client_secret: process.env.DISCORD_CLIENT_SECRET ?? '',
  token: process.env.DISCORD_TOKEN ?? '',
  channel_focused: process.env.DISCORD_CHANNEL_NAME ?? ''
};
