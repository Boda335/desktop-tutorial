/**
 * @type {import("@utils/types/baseCommand")}
 */
const {
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  // Command configuration
  name: "play",
  description: "play Music",
  category: "UTILITY",
  botPermissions: ["SendMessages"],
  userPermissions: ["SendMessages"],
  cooldown: 1000,
  command: { enabled: false, minArgsCount: 1 },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "song",
        type: ApplicationCommandOptionType.String,
        description: "song name or url",
        required: false,
      },
    ],
  },

  // Slash command execution
  async interactionExecute(client, interaction) {
    try {
      let voice = interaction.member.voice.channel;
      let messageOption = interaction.options.get('song');
      let song = messageOption ? messageOption.value : null;

      if (!voice) {
        return await interaction.reply({ content: "You need to be in a voice channel to play music.", ephemeral: true });
      }

      if (!song) {
        return await interaction.reply({ content: "Please provide a song name or URL.", ephemeral: true });
      }

      // Step 1: Initial reply, telling the user that the bot is searching for the song
      await interaction.reply({
        content: `Searching for: \`${song}\``
      });

      // Step 2: Play the song using Distube
      await client.distube.play(voice, song, {
        textChannel: interaction.channel,
        member: interaction.member,
        interaction,
      });

      // Step 3: Wait for the song to be added to the queue
      const queue = await client.distube.getQueue(voice);
      const songInfo = queue ? queue.songs[0] : null; // Getting the current song in the queue

      if (!songInfo) {
        return await interaction.editReply({ content: "No song found with the provided search query.", ephemeral: true });
      }

      // Step 4: Create embed with song details
      const embed = new EmbedBuilder()
        .setTitle("Now Playing")
        .setDescription(`**${songInfo.name}**`)
        .setColor("Blue")
        .addFields(
          { name: "Duration", value: songInfo.formattedDuration, inline: true },
          { name: "Requested by", value: interaction.member.user.tag, inline: true }
        )
        .setThumbnail(songInfo.thumbnail)  // Using song thumbnail image
        .setURL(songInfo.url);  // Optionally, you can link to the song URL

      // Step 5: Edit the initial reply with the song details
      await interaction.channel.send({ content: null, embeds: [embed] });
    } catch (err) {
      console.log(err);
      // Handling errors
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: "An error occurred while processing your request.", ephemeral: true });
      } else {
        await interaction.reply({ content: "An error occurred while processing your request.", ephemeral: true });
      }
    }
  },
};
