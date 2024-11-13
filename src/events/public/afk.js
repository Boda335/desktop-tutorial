const { CommandHandler } = require('@src/handlers');
const { EmbedBuilder } = require("discord.js");
const BEV = require("@utils/types/baseEvents");

/** @type {BEV.BaseEvent<"messageCreate">} */
module.exports = {
  name: "messageCreate",
  async execute(client, message) {
    try {
      // Ignore messages from bots or outside guilds
      if (message.author.bot || !message.guild) return;

      // Handle prefix commands
      CommandHandler.handlePrefixCommand(client, message);

      const userId = message.author.id;
      const afkUsers = await client.db.get("afk") || {};

      // Check if the user is marked as AFK
      if (afkUsers[userId]) {
        const { timestamp, reason } = afkUsers[userId];
        
        // Calculate the duration the user was AFK in milliseconds
        const afkDuration = Date.now() - timestamp;
      
        // Function to format the AFK duration in appropriate units
        function formatDuration(ms) {
          const seconds = Math.floor(ms / 1000);
          const minutes = Math.floor(ms / 60000);
          const hours = Math.floor(ms / 3600000);
          const days = Math.floor(ms / 86400000);
      
          if (seconds < 60) return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
          if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
          if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
          return `${days} ${days === 1 ? "day" : "days"}`;
        }
      
        const afkDurationText = formatDuration(afkDuration);
        const usergolb = message.author.username;
      
        // Send the embed message
        await message.reply({
          content: `Welcome back, ${usergolb}! I removed your AFK. You were AFK for ${afkDurationText}.`,
          allowedMentions: { users: [] }
        });

        // Remove the user from the AFK database
        delete afkUsers[userId];
        await client.db.set("afk", afkUsers);
      }

      // Check if message mentions a user who is AFK
      const mentionedUsers = message.mentions.users;
      for (const [mentionedUserId, user] of mentionedUsers) {
        if (afkUsers[mentionedUserId]) {
          const { timestamp, reason } = afkUsers[mentionedUserId];
            const afkuser = user.globalName || user.username
            await message.reply({
              content: `${afkuser} is AFK globally: AFK - <t:${Math.floor(timestamp / 1000)}:R>`,
              allowedMentions: { users: [] } // هذا سيمنع أي منشن في الرسالة
            });
        }
      }
    } catch (error) {
      console.error(error);
      message.reply({ content: 'There was an error processing the request!' });
    }
  }
};
