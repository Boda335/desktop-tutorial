const { ActionRowBuilder, UserSelectMenuBuilder,PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  // Component configuration
  name: "trust",
  enabled: true,

  async action(client, interaction, parts) {
    const filePath = path.join(__dirname, "..", "..", "events", "temp-voice", "userVoiceData.json");
    let data = {};
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

    const selectMenu = new UserSelectMenuBuilder()
      .setCustomId("selectUserToInvite")
      .setMinValues(1)
      .setMaxValues(10)
      .setPlaceholder("اختر أعضاء لإرسال دعوات");

    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    // الرد الأول مع السيلكت ويكون إيفرمنال
    await interaction.reply({
      content: "اختر أعضاء لإرسال دعوات لقناتك الصوتية (بحد أقصى 10 أعضاء):",
      components: [actionRow],
      ephemeral: true
    });

    const filter = (i) => i.customId === "selectUserToInvite" && i.user.id === interaction.user.id;
    const collected = await interaction.channel.awaitMessageComponent({
      filter,
      time: 60000,
    }).catch(() => null);

    if (collected) {
      const selectedUserIds = collected.values; // جميع المعرفات التي تم اختيارها
      const selectedUsers = await Promise.all(selectedUserIds.map(userId => client.users.fetch(userId)));

      // تحقق من أن عدد المستخدمين المختارين لا يتجاوز 10
      if (selectedUsers.length > 10) {
        await collected.update({
          content: "يمكنك دعوة 10 أعضاء فقط في المرة الواحدة.",
          components: [], // إخفاء السيلكت بعد إرسال الرسالة
        });
        return;
      }

      // إضافة المستخدمين للمصفوفة trustrd
      selectedUsers.forEach(user => {
        if (!userVoiceData.trustrd) {
          userVoiceData.trustrd = []; // التأكد من وجود المصفوفة
        }
        if (!userVoiceData.trustrd.includes(user.id)) {
          userVoiceData.trustrd.push(user.id); // إضافة المعرف للمصفوفة
        }
      });

      // حفظ البيانات المحدثة
      data[interaction.user.id] = userVoiceData;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      const voiceChannel = interaction.guild.channels.cache.get(userVoiceData.voiceChannelId);
      if (voiceChannel) {
        selectedUserIds.forEach(async (userId) => {
          const user = await interaction.guild.members.fetch(userId);
          // إزالة جميع الصلاحيات (باستثناء الإذن بالظهور في القناة)
          await voiceChannel.permissionOverwrites.edit(user, {
            [PermissionsBitField.Flags.ViewChannel]: true, 
            [PermissionsBitField.Flags.Connect]: true,    
            [PermissionsBitField.Flags.Speak]: true,     
            [PermissionsBitField.Flags.SendMessages]: true,     
          });
        });
      }
      // تعديل الرسالة لتصبح رسالة التأكيد بعد إضافة الأعضاء
      await collected.update({
        content: `تم إضافة **${selectedUsers.map(user => user.username).join(", ")}** إلى قناتك الصوتية.`,
        components: [], // إخفاء السيلكت بعد إضافة الأعضاء
      });
    } else {
      await interaction.followUp({
        content: "لم يتم اختيار أي عضو أو انتهت المهلة.",
        ephemeral: true,
      });
    }
  },
};
