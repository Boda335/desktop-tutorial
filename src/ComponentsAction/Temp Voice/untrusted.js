const { ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "untrust",
  enabled: true,

  async action(client, interaction, parts) {
    const filePath = path.join(__dirname, "..", "..", "events", "temp-voice", "userVoiceData.json");
    let data = {};
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath);
      data = JSON.parse(fileContent);
    }
    const config = require('../../../config.json');
    const userVoiceData = data[interaction.user.id];
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
      .setDescription(`# No Valid Channel! \n You are not in a valid temporary voice channel. Join a **Creator Channel** first:\n \n <#${voiceChannelId}>`)
      .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
    if (!userVoiceData || !userVoiceData.voiceChannelId) {
      return interaction.reply({
        embeds: [nov],
        ephemeral: true
      });
    }
    const notrs= new EmbedBuilder()
    .setColor('White')
    .setImage('https://e.top4top.io/p_3236d5htv1.png')
    .setDescription(`# Not Possible! \n There are no users that you can select from.`)
    .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
    if (!userVoiceData.trustrd || userVoiceData.trustrd.length === 0) {
      return interaction.reply({
        embeds:[notrs],
        ephemeral: true
      });
    }

    // إنشاء قائمة باستخدام StringSelectMenuBuilder مع أسماء المستخدمين
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("selectUserToRemove")
      .setMinValues(1)
      .setMaxValues(userVoiceData.trustrd.length)
      .setPlaceholder("Selected user will be untrusted");

    // إضافة الأعضاء الموثوق بهم كخيارات في القائمة
    userVoiceData.trustrd.forEach(userId => {
      const user = client.users.cache.get(userId);
      if (user) {
        selectMenu.addOptions({
          label: user.username,
          value: user.id,
          emoji: config.tempVemoji.ping
        });
      }
    });

    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      components: [actionRow],
      ephemeral: true
    });

    const filter = (i) => i.customId === "selectUserToRemove" && i.user.id === interaction.user.id;
    const collected = await interaction.channel.awaitMessageComponent({
      filter,
      time: 60000,
    }).catch(() => null);

    if (collected) {
      const selectedUserIds = collected.values;

      // إضافة المستخدمين إلى قائمة "غير الموثوق بهم"
      if (!userVoiceData.untrusted) {
        userVoiceData.untrusted = [];
      }

      selectedUserIds.forEach(userId => {
        const index = userVoiceData.trustrd.indexOf(userId);
        if (index !== -1) {
          userVoiceData.trustrd.splice(index, 1);  // إزالة من قائمة الموثوق بهم
          userVoiceData.untrusted.push(userId);   // إضافة إلى قائمة غير الموثوق بهم
        }
      });

      // تحديث البيانات في الملف
      data[interaction.user.id] = userVoiceData;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      // تحديث أذونات القناة الصوتية
      const voiceChannel = interaction.guild.channels.cache.get(userVoiceData.voiceChannelId);
      if (voiceChannel) {
        selectedUserIds.forEach(async (userId) => {
          const user = await interaction.guild.members.fetch(userId);
          // إزالة جميع الصلاحيات (باستثناء الإذن بالظهور في القناة)
          await voiceChannel.permissionOverwrites.edit(user, {
            [PermissionsBitField.Flags.ViewChannel]: null, // إزالة صلاحية رؤية القناة
            [PermissionsBitField.Flags.Connect]: null,     // إزالة صلاحية الاتصال
            [PermissionsBitField.Flags.Speak]: null,      // إزالة صلاحية التحدث
            [PermissionsBitField.Flags.SendMessages]: null,      // إزالة صلاحية التحدث
          });
        });
      }
      const dn = new EmbedBuilder()
      .setColor('White')
      .setImage('https://e.top4top.io/p_3236d5htv1.png')
      .setDescription(`# Untrusted!\n Selected users are no longer trusted in your temporary voice channels.`)
      .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
      await collected.update({
       embeds:[dn],
        components: [],
      });
    } else {
      await interaction.followUp({
        content: "لم يتم اختيار أي عضو أو انتهت المهلة.",
        ephemeral: true,
      });
    }
  },
};
