// استيراد المكتبات المطلوبة من discord.js
const { PermissionsBitField, ChannelType, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "claim",
  enabled: true,

  async action(client, interaction) {



    const data1 = await client.db.get(`${interaction.guildId}`);

    // تحقق مما إذا كانت بيانات القناة الصوتية المؤقتة موجودة
    if (!data1 || !data1.temp_channels || !data1.temp_channels.voice_channel) {
      return interaction.reply({ content: "لا توجد قناة صوتية مؤقتة مخزنة لهذا الخادم.", ephemeral: true });
    }

    // الحصول على معرف القناة الصوتية المؤقتة
    const voiceChannelId = data1.temp_channels.voice_channel;    const voiceChannel = interaction.member.voice.channel;
    const nov = new EmbedBuilder()
    .setColor("White")
    .setTitle("**No Valid Channel!**")
    .setImage('https://e.top4top.io/p_3236d5htv1.png')
    .setDescription(`You are not in a valid temporary voice channel. Join a **Creator Channel** first:\n \n <#${voiceChannelId}>`)
    .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
    if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
      return interaction.reply({
        embeds: [nov],
        ephemeral: true,
      });
    }

    // تحديد مسار الملف لبيانات المستخدمين
    const filePath = path.join(__dirname,"..", "..", "events", "temp-voice", "userVoiceData.json");
    let data = {};

    // قراءة البيانات من الملف
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath);
      data = JSON.parse(fileContent);
    }

    // جلب معلومات صاحب القناة من الملف
    const currentOwnerData = Object.values(data).find((user) => user.voiceChannelId === voiceChannel.id);
    const currentOwnerId = currentOwnerData?.ownerId;
    const noow = new EmbedBuilder()
      .setColor("White")
      .setTitle("**No Valid Onwer!**")
      .setImage('https://e.top4top.io/p_3236d5htv1.png')
      .setDescription(`It seems I can't find the owner of the channel`)
      .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
    if (!currentOwnerId) {
      return interaction.reply({
        embeds: [noow],
        ephemeral: true,
      });
    }
    if (interaction.user.id === currentOwnerId) {
      const ownChannelEmbed = new EmbedBuilder()
        .setColor("White")
        .setImage('https://e.top4top.io/p_3236d5htv1.png')
        .setDescription(`# Not Possible! \n You cannot claim your own temporary voice channel.`)
        .setFooter({ text: 'Powered By Nexus System', iconURL: client.user.displayAvatarURL() });
      return interaction.reply({
        embeds: [ownChannelEmbed],
        ephemeral: true,
      });
    }
    // التحقق إذا كان صاحب القناة موجودًا في القناة
    const ownerInChannel = voiceChannel.members.has(currentOwnerId);
    const on = new EmbedBuilder()
    .setColor('White')
    .setImage('https://e.top4top.io/p_3236d5htv1.png')
    .setDescription(`# I can't do that!! \n The owner, <@${currentOwnerId}> is still connected to this temporary voice channel. `)
    .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
    if (ownerInChannel) {
      return interaction.reply({
        embeds: [on],
        ephemeral: true,
      });
    }

    const nomem = new EmbedBuilder()
    .setColor("White")
    .setImage('https://e.top4top.io/p_3236d5htv1.png')
    .setDescription(`# Not Possible! \nIt seems that there are no other members in the Voice Channel`)
    .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
    const otherMembers = voiceChannel.members.filter(member => !member.user.bot && member.id !== currentOwnerId);
    if (otherMembers.size === 0) {
      return interaction.reply({
        embeds: [nomem],
        ephemeral: true,
      });
    }

    // اختيار أول عضو في القائمة كمالك جديد للقناة
    const newOwner = otherMembers.first();

    // إذا كانت لدى العضو الجديد بيانات سابقة، احذفها مع الاحتفاظ ببيانات القناة الجديدة فقط
    if (data[newOwner.id]) {
      delete data[newOwner.id]; // مسح البيانات السابقة للعضو الجديد
    }

    // تحديث ملكية القناة واسمها
    await voiceChannel.edit({
      name: `${newOwner.displayName}'s Channel`,
      permissionOverwrites: [
        {
          id: newOwner.id,
          allow: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.Connect],
        },
        {
          id: interaction.guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ManageChannels],
        },
      ],
    });

    // تحديث بيانات الملكية في الملف مع بيانات القناة الجديدة فقط
    data[newOwner.id] = {
      voiceChannelId: voiceChannel.id,
      voiceChannelname: voiceChannel.name,
      userLimit: voiceChannel.userLimit,
      trustrd: currentOwnerData?.trustrd || [],
      ownerId: newOwner.id, // تعيين العضو الجديد كمالك للقناة
    };
    delete data[currentOwnerId]; // حذف بيانات المالك السابق

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    const dn = new EmbedBuilder()
    .setColor('White')
    .setImage('https://e.top4top.io/p_3236d5htv1.png')
    .setDescription(`# Claimed! \n You now have ownership of this temporary voice channel. `)
    .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
    await interaction.reply({
      content: `تم نقل ملكية القناة إلى ${newOwner.displayName} وتم تحديث بيانات القناة.`,
      ephemeral: true,
    });
  },
};
