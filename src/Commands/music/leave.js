/**
 * @type {import("@utils/types/baseCommand")}
 */
const {
    EmbedBuilder,
  } = require("discord.js");
  
  module.exports = {
    // Command configuration
    name: "leave",
    description: "Leave voice channel",
    category: "UTILITY",
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
  
        // Check if the user is in a voice channel
        if (!botVoice) {
          return await interaction.reply({ content: "The bot is not in a voice channel.", ephemeral: true });
        }
  
        // Check if the user is in the same voice channel as the bot
        if (!voice) {
          return await interaction.reply({ content: "You need to be in a voice channel to make the bot leave.", ephemeral: true });
        }
  
        const embed = new EmbedBuilder()
          .setTitle("Leaving the voice channel")
          .setColor("White");
  
        // Ensure distube is correctly initialized
        const distube = client.distube;
  
        if (!distube) {
          return await interaction.reply({ content: "Distube is not initialized properly.", ephemeral: true });
        }
  
        // Use distube to leave the voice channel
        distube.voices.leave(interaction.guild);
  
        await interaction.reply({ embeds: [embed] });
      } catch (err) {
        console.log(err);
        await interaction.reply({ content: "An error occurred while trying to leave the voice channel.", ephemeral: true });
      }
    },
  };