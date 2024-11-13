// Import necessary classes from discord.js
const { ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder } = require("discord.js")
const fs = require("fs");
const path = require("path");
const config = require('../../../config.json');
/**
 * @type {import("@utils/types/baseComponent")}
 */
module.exports = {
  name: "delete",
  enabled: true,
  async action(client, interaction, parts) {
    const filePath = path.join(__dirname, "..", "..", "events", "temp-voice", "userVoiceData.json");
    let data = {};

    // التحقق من وجود الملف وقراءته
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath);
      data = JSON.parse(fileContent);
    }
    const data1 = await client.db.get(`${interaction.guildId}`);

    // تحقق مما إذا كانت بيانات القناة الصوتية المؤقتة موجودة
    if (!data1 || !data1.temp_channels || !data1.temp_channels.voice_channel) {
      return interaction.reply({ content: "لا توجد قناة صوتية مؤقتة مخزنة لهذا الخادم.", ephemeral: true });
    }

    // الحصول على معرف القناة الصوتية المؤقتة
    const voiceChannelId = data1.temp_channels.voice_channel;
    const nov = new EmbedBuilder()
    .setColor("White")
    .setTitle("**No Valid Channel!**")
    .setImage('https://e.top4top.io/p_3236d5htv1.png')
    .setDescription(`You are not in a valid temporary voice channel. Join a **Creator Channel** first:\n \n <#${voiceChannelId}>`)
    .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });    const userVoiceData = data[interaction.user.id];
    if (!userVoiceData || !userVoiceData.voiceChannelId) {
      // إذا لم تكن هناك قناة مسجلة للمستخدم، إخباره بذلك
      return interaction.reply({
        embeds: [nov],
        ephemeral: true
      });
    }
    // Create an embed message
    const embed = new EmbedBuilder()
      .setDescription("# Are You Sure? \n Your temporary voice channel will be deleted. Please confirm by using the button below.")
      .setColor('White')
      .setImage('https://e.top4top.io/p_3236d5htv1.png')
      .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
      const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
        .setEmoji(config.tempVemoji.delete)
        .setCustomId('del')
        .setStyle(ButtonStyle.Secondary)
      )
    // Reply to the interaction with the embed message
    interaction.reply({
      embeds: [embed],
      components:[row],
      ephemeral: true
    });
  },
};
