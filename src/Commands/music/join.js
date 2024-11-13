/**
 * @type {import("@utils/types/baseCommand")}
 */
const {
  ApplicationCommandOptionType,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  // Command configuration
  name: "join",
  description: "Join voice channel",
  category: "MUSIC",
  botPermissions: ["SendMessages"],
  userPermissions: ["SendMessages"],
  cooldown: 1000,
  command: { enabled: false, minArgsCount: 0 },
  slashCommand: {
    enabled: true,
  },

  // Slash command execution
  async interactionExecute(client, interaction) {
    try {
      let voice = interaction.member.voice.channel;
      let botVoice = interaction.guild.members.me.voice.channel;

      // Check if the user is already in a voice channel
      if (!voice) {
        return await interaction.reply({ content: "You need to be in a voice channel to join.", ephemeral: true });
      }

      // Check if the bot is already in a voice channel
      if (botVoice) {
        return await interaction.reply({ content: "The bot is already in a voice channel.", ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle("Joining your request")
        .setColor("White");

      // Ensure distube is correctly initialized
      const distube = client.distube;

      if (!distube) {
        return await interaction.reply({ content: "Distube is not initialized properly.", ephemeral: true });
      }

      // Use distube to join the voice channel
      await distube.voices.join(voice);

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.log(err);
      await interaction.reply({ content: "An error occurred while trying to join the voice channel.", ephemeral: true });
    }
  },
};