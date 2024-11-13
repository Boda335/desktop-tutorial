const { ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require('../../../config.json');
module.exports = {
  name: "transfer",
  enabled: true,

  async action(client, interaction) {

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

    const userVoiceData = data[interaction.user.id];
    if (!userVoiceData || !userVoiceData.voiceChannelId) {
      return interaction.reply({
        embeds: [nov],
        ephemeral: true
      });
    }
    // جلب معلومات القناة الخاصة بصاحب القناة
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
    // إنشاء Select Menu لإظهار قائمة الأعضاء
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("transferOwnership")
      .setMinValues(1)
      .setMaxValues(membersInChannel.size)
      .setPlaceholder("The selected user willgain the ownership");

    membersInChannel.forEach(member => {
      selectMenu.addOptions({
        label: member.user.username,
        value: member.user.id,
        emoji: config.tempVemoji.ping
      });
    });

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      components: [row],
      ephemeral: true,
    });

    // بدلاً من collector نستخدم awaitMessageComponent
    const filter = (i) => i.customId === "transferOwnership" && i.user.id === interaction.user.id;
    const collected = await interaction.channel.awaitMessageComponent({
      filter,
      time: 60000,
    }).catch(() => null);

    if (collected) {
      const selectedMemberId = collected.values[0];
      const selectedMember = voiceChannel.members.get(selectedMemberId);

      if (!selectedMember) {
        return collected.reply({
          content: "لم يعد الشخص موجودًا في القناة الصوتية.",
          ephemeral: true,
        });
      }

      // تحديث ملكية القناة واسمها
      await voiceChannel.edit({
        name: `${selectedMember.displayName}'s Channel`,
        permissionOverwrites: [
          {
            id: selectedMember.id,
            allow: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.Connect],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: [PermissionsBitField.Flags.ManageChannels],
          },
        ],
      });

      // تحديث بيانات القناة في الملف
      data[selectedMember.id] = {
        ...data[selectedMember.id],
        voiceChannelId: voiceChannel.id,
        voiceChannelname: voiceChannel.name,
        userLimit: voiceChannel.userLimit,
        trustrd: data[interaction.member.id]?.trustrd || [],
        ownerId: selectedMember.id, // تعيين العضو الجديد كمالك للقناة
      };
      delete data[interaction.member.id]; // حذف بيانات المالك السابق

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      const dn = new EmbedBuilder()
      .setColor('White')
      .setImage('https://e.top4top.io/p_3236d5htv1.png')
      .setDescription(`# Transferred! \nYou transferred the channel‘s ownership to <@${selectedMember.id}>`)
      .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
      await collected.update({
        embeds:[dn],
        components: [],
      });
    } else {
      await interaction.followUp({
        content: "انتهت المهلة أو لم يتم اختيار أي شخص.",
        ephemeral: true,
      });
    }
  },
};
