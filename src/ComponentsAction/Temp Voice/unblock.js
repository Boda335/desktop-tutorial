const { ActionRowBuilder,StringSelectMenuBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

/**
 * @type {import("@utils/types/baseComponent")}
 */
module.exports = {
  // Component configuration
  name: "unblock",
  enabled: true,

  // Action to perform when the button is clicked
  async action(client, interaction, parts) {
    const filePath = path.join(__dirname, "..", "..", "events", "temp-voice", "userVoiceData.json");
    let data = {};
    const config = require('../../../config.json');
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
      .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
    const userVoiceData = data[interaction.user.id];
    if (!userVoiceData || !userVoiceData.voiceChannelId) {
      return interaction.reply({
        embeds: [nov],
        ephemeral: true
      });
    }

    // التحقق من وجود الملف وقراءته
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath);
      data = JSON.parse(fileContent);
    }

    if (!userVoiceData || !userVoiceData.untrusted || userVoiceData.untrusted.length === 0) {
      return interaction.reply({
        content: "لا توجد أي أعضاء في قائمة المحظورين.",
        ephemeral: true
      });
    }

    // إنشاء قائمة باستخدام StringSelectMenuBuilder مع أسماء المستخدمين المحظورين
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("selectUserToUnblock")
      .setMinValues(1)
      .setMaxValues(userVoiceData.untrusted.length)
      .setPlaceholder("اختر الأعضاء لإزالتهم من قائمة المحظورين");

    // إضافة الأعضاء المحظورين كخيارات في القائمة
    userVoiceData.untrusted.forEach(userId => {
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

    // إرسال الرسالة مع القائمة
    await interaction.reply({
      content: "اختر الأعضاء لإزالتهم من قائمة المحظورين:",
      components: [actionRow],
      ephemeral: true
    });

    const filter = (i) => i.customId === "selectUserToUnblock" && i.user.id === interaction.user.id;
    const collected = await interaction.channel.awaitMessageComponent({
      filter,
      time: 60000,
    }).catch(() => null);

    if (collected) {
      const selectedUserIds = collected.values;

      // إزالة المستخدمين المختارين من قائمة المحظورين
      selectedUserIds.forEach(userId => {
        const index = userVoiceData.untrusted.indexOf(userId);
        if (index !== -1) {
          // إزالة المستخدم من قائمة "untrusted"
          userVoiceData.untrusted.splice(index, 1);
        }

        // إخراج العضو من القناة الصوتية
        const user = client.users.cache.get(userId);
        if (user) {
          const voiceChannel = userVoiceData.voiceChannelId && client.channels.cache.get(userVoiceData.voiceChannelId);
          if (voiceChannel) {
            const member = voiceChannel.members.get(user.id);
            if (member) {
              member.voice.disconnect().catch(console.error);
            }
          }
        }
      });
      selectedUserIds.forEach(async (userId) => {
        const user = await interaction.guild.members.fetch(userId);
        const voiceChannel = interaction.guild.channels.cache.get(userVoiceData.voiceChannelId);
        if (voiceChannel) {
          await voiceChannel.permissionOverwrites.edit(user, {
            [PermissionsBitField.Flags.ViewChannel]: true,  // السماح برؤية القناة
            [PermissionsBitField.Flags.Connect]: true,      // السماح بالانضمام
            [PermissionsBitField.Flags.Speak]: true,        // السماح بالتحدث
            [PermissionsBitField.Flags.SendMessages]: true, // السماح بإرسال الرسائل
          });
        }
      });
      // حفظ البيانات المحدثة
      data[interaction.user.id] = userVoiceData;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      await collected.update({
        content: `تمت إزالة **${selectedUserIds.map(userId => client.users.cache.get(userId)?.username || "Unknown User").join(", ")}** من قائمة المحظورين.`,
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
