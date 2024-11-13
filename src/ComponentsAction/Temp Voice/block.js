const { ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "block",
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
      .setImage('https://e.top4top.io/p_3236d5htv1.png')
      .setDescription(`# No Valid Channel! \nYou are not in a valid temporary voice channel. Join a **Creator Channel** first:\n \n <#${voiceChannelId}>`)
      .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });

    const config = require('../../../config.json');
    const userVoiceData = data[interaction.user.id];
    if (!userVoiceData || !userVoiceData.voiceChannelId) {
      return interaction.reply({
        embeds: [nov],
        ephemeral: true
      });
    }

    const voiceChannel = await client.channels.fetch(userVoiceData.voiceChannelId);
    
    const membersInChannel = voiceChannel.members.filter(member => !member.user.bot && member.id !== interaction.user.id); // استبعاد صاحب الفويس
    const nomem = new EmbedBuilder()
      .setColor("White")
      .setImage('https://e.top4top.io/p_3236d5htv1.png')
      .setDescription(`# Not Possible! \nIt seems that there are no other members in the Voice Channel`)
      .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });

    if (membersInChannel.size === 0) {
      return interaction.reply({
        embeds: [nomem],
        ephemeral: true
      });
    }

    // إنشاء قائمة باستخدام StringSelectMenuBuilder مع أسماء الأعضاء في القناة الصوتية
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("selectUserToBlock")
      .setMinValues(1)
      .setMaxValues(membersInChannel.size)
      .setPlaceholder("Select users will be Kicked and Blocked");

    membersInChannel.forEach(member => {
      selectMenu.addOptions({
        label: member.user.username,
        value: member.user.id,
        emoji: config.tempVemoji.ping
      });
    });

    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      components: [actionRow],
      ephemeral: true
    });

    const filter = (i) => i.customId === "selectUserToBlock" && i.user.id === interaction.user.id;
    let collected = null;

    // إعادة إرسال التفاعل كل مرة بشكل جديد
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on('collect', async (collectedInteraction) => {
      const selectedUserIds = collectedInteraction.values;

      selectedUserIds.forEach(userId => {
        // إخراج العضو من القناة الصوتية
        const user = client.users.cache.get(userId);
        if (user) {
          const member = voiceChannel.members.get(user.id);
          if (member) {
            member.voice.disconnect().catch(console.error);
          }
        }

        // إضافة العضو إلى قائمة المحظورين (untrusted)
        if (!userVoiceData.untrusted) {
          userVoiceData.untrusted = [];
        }
        if (!userVoiceData.untrusted.includes(userId)) {
          userVoiceData.untrusted.push(userId);
        }

        // إزالة الأذونات من العضو
        voiceChannel.permissionOverwrites.edit(userId, {
          [PermissionsBitField.Flags.ViewChannel]: null,
          [PermissionsBitField.Flags.Connect]: false,
          [PermissionsBitField.Flags.Speak]: null,
          [PermissionsBitField.Flags.MuteMembers]: null,
          [PermissionsBitField.Flags.DeafenMembers]: null,
          [PermissionsBitField.Flags.MoveMembers]: null,
        });
      });

      // حفظ البيانات المحدثة
      data[interaction.user.id] = userVoiceData;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      const dn = new EmbedBuilder()
        .setColor("White")
        .setImage('https://e.top4top.io/p_3236d5htv1.png')
        .setDescription(`# Blocked! \nSelected users have been blocked from your temporary voice channels.`)
        .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });

      await collectedInteraction.update({
        embeds: [dn],
        components: [],
      });

      // إيقاف التجميع بعد التفاعل
      collector.stop();
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        await interaction.followUp({
          content: "No member has been selected or timed out.",
          ephemeral: true,
        });
      }
    });
  },
};
