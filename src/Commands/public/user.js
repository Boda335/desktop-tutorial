// Import necessary classes from discord.js
const { EmbedBuilder } = require("discord.js");

/**
 * @type {import("@utils/types/baseCommand")}
 */
module.exports = {
  // Command configuration
  name: "user",
  description: "show user info",
  category: "PUBLIC",
  botPermissions: ["SendMessages"],
  userPermissions: ["SendMessages"],
  cooldown: 1000,
  command: { enabled: false, minArgsCount: 1 },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        type: 6,  // تعيين النوع إلى 6 (أي USER)
        description: "Select a user to view their info",
        required: false, // الاختياري
      },
    ],
  },

  // Slash command execution
  async interactionExecute(client, interaction) {
    try {
      // Get specified user or default to interaction user
      const user = interaction.options.getUser("user") || interaction.user;
      const member = interaction.guild.members.cache.get(user.id); // Get member object for server info

      // Create embed for user information
      const embed = new EmbedBuilder()
        .setColor('White')
        .setTimestamp()
        .setThumbnail(user.displayAvatarURL())
        .setAuthor({ name: `${client.user.username}`, iconURL: `${client.user.displayAvatarURL()}` })
        .setDescription(`**Here are the details for <@${user.id}>**:`)
        .addFields(
          { name: "User name", value: user.username || "N/A", inline: true },
          { name: "Global name", value: user.globalName || "N/A", inline: false },
          { name: "ID", value: user.id || "N/A", inline: false },
          { 
            name: "Account Created", 
            value: user.createdAt ? `<t:${Math.floor(user.createdAt.getTime() / 1000)}:R>` : "N/A", // Format as <t:r> for account creation
            inline: false 
          },
          { 
            name: "Joined Server", 
            value: member && member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : "N/A", // Format as <t:r> for server join time
            inline: false 
          },
        )
        .setFooter({ text: `Requested By: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });



      // Reply with the embed and buttons
      await interaction.reply({ embeds: [embed]});

    } catch (err) {
      console.log(err);
    }
  },
};
