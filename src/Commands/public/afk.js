// Import necessary classes from discord.js
const { EmbedBuilder } = require("discord.js");

/**
 * @type {import("@utils/types/baseCommand")}
 */
module.exports = {
  name: "afk",
  description: "Set the author as AFK, also records pings",
  category: "PUBLIC",
  botPermissions: ["SendMessages"],
  userPermissions: ["SendMessages"],
  cooldown: 1000,
  command: { enabled: false, minArgsCount: 1 },
  slashCommand: { 
    enabled: true,
    options: [
      {
        name: "reason",
        type: 3, // Type 3 is for STRING
        description: "Reason for going AFK",
        required: false,
      },
    ],
  },

  // Message command execution
  async msgExecute(client, message, args, lang) {
    try {

    } catch (err) {
      console.log(err)
    }

  },

  // Slash command execution
  async interactionExecute(client, interaction) {
    try {
      const userId = interaction.user.id;

      // Check if user is already AFK
      const afkUsers = await client.db.get("afk") || {};
      if (afkUsers[userId]) {
        return interaction.reply({ content: "You are already marked as AFK.", ephemeral: true });
      }

      // Get the reason from interaction options
      const reason = interaction.options.getString("reason") || "AFK";

      // Set AFK status with timestamp and reason
      const timestamp = Date.now();
      afkUsers[userId] = { timestamp, reason };
      await client.db.set("afk", afkUsers);

      // Create and send embed
      const embed = new EmbedBuilder()
        .setColor("White")
        .setTitle("AFK Set!")
        .setDescription(`I have marked you as AFK in all servers, with reason: ${reason}`);

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.log(err);
    }
  },
};
