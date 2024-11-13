const { ActionRowBuilder, SelectMenuBuilder, PermissionsBitField,EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "privcy",
  enabled: true,

  async action(client, interaction, parts) {
    const filePath = path.join(__dirname, "..", "..", "events", "temp-voice", "userVoiceData.json");
    let data = {};

    // تحميل البيانات من الملف إذا كان موجودًا
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
      .setDescription(`#No Valid Channel! \n You are not in a valid temporary voice channel. Join a **Creator Channel** first:\n \n <#${voiceChannelId}>`)
      .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
    // الحصول على بيانات القناة الصوتية للمستخدم
    const userVoiceData = data[interaction.user.id];
    if (!userVoiceData || !userVoiceData.voiceChannelId) {
      return interaction.reply({
        embeds: [nov],
        ephemeral: true
      });
    }

    // إنشاء قائمة منسدلة (Select Menu) مع خيارات مختلفة للصلاحيات
    const selectMenu = new SelectMenuBuilder()
      .setCustomId("lockUnlockChannel")
      .setPlaceholder("Select a Privacy Option")
      .addOptions([
        {
          label: "Lock",
          value: "lock",
          description: "Only Trusted users will be able to join your voice channel",
        },
        {
          label: "Unlock",
          value: "unlock",
          description: "Everyone will be able to join your voice channel",
        },
        {
          label: "Invisible",
          value: "Invisible",
          description: "Only trusted users will be able to view your voice channel",
        },
        {
          label: "Visible",
          value: "Visible",
          description: "Everyone will be able to view your voice channel",
        },
        {
          label: "Close Chat",
          value: "Close",
          description: "Only trusted users will be able to text in your chat",
        },
      ]);

    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    // إرسال الرد الأول مع السيلكت مينو
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        components: [actionRow],
        ephemeral: true
      });
    }

    // انتظار التفاعل مع السيلكت مينو
    const filter = (i) => i.customId === "lockUnlockChannel" && i.user.id === interaction.user.id;
    const collected = await interaction.channel.awaitMessageComponent({
      filter,
      time: 60000, // مهلة الانتظار لمدة 60 ثانية
    }).catch(() => null);

    if (collected) {
      const selectedValue = collected.values[0]; // الخيار المختار (lock أو unlock)

      const voiceChannel = interaction.guild.channels.cache.get(userVoiceData.voiceChannelId);
      if (!voiceChannel) return;

      // التأكد من أن صاحب القناة لن يتأثر بالتعديلات
      const owner = await interaction.guild.members.fetch(userVoiceData.ownerId); // المستخدم الذي يملك القناة

      if (selectedValue === "lock") {
        const trustedUsers = userVoiceData.trustrd || [];

        // تطبيق الصلاحيات على الجميع ماعدا صاحب القناة
        await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
          [PermissionsBitField.Flags.Connect]: false,
          [PermissionsBitField.Flags.ViewChannel]: true,
        });

        trustedUsers.forEach(async (userId) => {
          const user = await interaction.guild.members.fetch(userId);
          await voiceChannel.permissionOverwrites.edit(user, {
            [PermissionsBitField.Flags.ViewChannel]: true,
            [PermissionsBitField.Flags.Connect]: true,
            [PermissionsBitField.Flags.Speak]: true,
          });
        });

        // عدم تعديل صلاحيات صاحب القناة
        await voiceChannel.permissionOverwrites.edit(owner, {
          [PermissionsBitField.Flags.ViewChannel]: true,
          [PermissionsBitField.Flags.Connect]: true,
          [PermissionsBitField.Flags.Speak]: true,
        });

        // تحديث البيانات في الملف
        data[interaction.user.id].channelPrivacy = "locked";  // حفظ الحالة
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        const locked = new EmbedBuilder()
        .setColor("White")
        .setImage('https://e.top4top.io/p_3236d5htv1.png')
        .setDescription(`# Updated! \n <#${userVoiceData.voiceChannelId}> Channel is now **locked**.\n \n `)
        .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
        await collected.update({
          embeds:[locked],
          components: [], // إخفاء السيلكت بعد تحديث الرسالة
        });
      }
      else if (selectedValue === "unlock") {
        await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
          [PermissionsBitField.Flags.ViewChannel]: true,
          [PermissionsBitField.Flags.Connect]: true,
          [PermissionsBitField.Flags.Speak]: true,
        });

        // عدم تعديل صلاحيات صاحب القناة
        await voiceChannel.permissionOverwrites.edit(owner, {
          [PermissionsBitField.Flags.ViewChannel]: true,
          [PermissionsBitField.Flags.Connect]: true,
          [PermissionsBitField.Flags.Speak]: true,
        });

        // تحديث البيانات في الملف
        data[interaction.user.id].channelPrivacy = "unlocked";  // حفظ الحالة
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        const unlocked = new EmbedBuilder()
        .setColor("White")
        .setImage('https://e.top4top.io/p_3236d5htv1.png')
        .setDescription(`# Updated! \n <#${userVoiceData.voiceChannelId}> Channel is now **unlocked**.\n \n `)
        .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
        await collected.update({
          embeds:[unlocked],
          components: [], // إخفاء السيلكت بعد تحديث الرسالة
        });
      }
      else if (selectedValue === "Invisible") {
        const trustedUsers = userVoiceData.trustrd || [];
        await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
          [PermissionsBitField.Flags.ViewChannel]: false,
        });

        trustedUsers.forEach(async (userId) => {
          const user = await interaction.guild.members.fetch(userId);
          await voiceChannel.permissionOverwrites.edit(user, {
            [PermissionsBitField.Flags.ViewChannel]: true,
            [PermissionsBitField.Flags.Connect]: true,
            [PermissionsBitField.Flags.Speak]: true,
          });
        });

        // عدم تعديل صلاحيات صاحب القناة
        await voiceChannel.permissionOverwrites.edit(owner, {
          [PermissionsBitField.Flags.ViewChannel]: true,
          [PermissionsBitField.Flags.Connect]: true,
          [PermissionsBitField.Flags.Speak]: true,
        });

        // تحديث البيانات في الملف
        data[interaction.user.id].channelPrivacy = "invisible";  // حفظ الحالة
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        const invisible = new EmbedBuilder()
        .setColor("White")
        .setImage('https://e.top4top.io/p_3236d5htv1.png')
        .setDescription(`# Updated! \n <#${userVoiceData.voiceChannelId}> Channel is now **invisible**.\n \n `)
        .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
        await collected.update({
          embeds:[invisible],
          components: [], // إخفاء السيلكت بعد تحديث الرسالة
        });
      }
      else if (selectedValue === "Visible") {
        await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
          [PermissionsBitField.Flags.ViewChannel]: true,
        });

        // عدم تعديل صلاحيات صاحب القناة
        await voiceChannel.permissionOverwrites.edit(owner, {
          [PermissionsBitField.Flags.ViewChannel]: true,
          [PermissionsBitField.Flags.Connect]: true,
          [PermissionsBitField.Flags.Speak]: true,
        });

        // تحديث البيانات في الملف
        data[interaction.user.id].channelPrivacy = "visible";  // حفظ الحالة
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        const visible = new EmbedBuilder()
        .setColor("White")
        .setImage('https://e.top4top.io/p_3236d5htv1.png')
        .setDescription(`# Updated! \n <#${userVoiceData.voiceChannelId}> Channel is now **visible**.\n \n `)
        .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
        await collected.update({
          embeds:[visible],
          components: [], // إخفاء السيلكت بعد تحديث الرسالة
        });
      }
      else if (selectedValue === "Close") {
        const trustedUsers = userVoiceData.trustrd || [];
        await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
          [PermissionsBitField.Flags.SendMessages]: false,
        });

        trustedUsers.forEach(async (userId) => {
          const user = await interaction.guild.members.fetch(userId);
          await voiceChannel.permissionOverwrites.edit(user, {
            [PermissionsBitField.Flags.SendMessages]: false,
            [PermissionsBitField.Flags.ViewChannel]: true,
            [PermissionsBitField.Flags.Connect]: true,
            [PermissionsBitField.Flags.Speak]: true,
          });
        });

        // عدم تعديل صلاحيات صاحب القناة
        await voiceChannel.permissionOverwrites.edit(owner, {
          [PermissionsBitField.Flags.SendMessages]: true,
          [PermissionsBitField.Flags.ViewChannel]: true,
          [PermissionsBitField.Flags.Connect]: true,
          [PermissionsBitField.Flags.Speak]: true,
        });

        // تحديث البيانات في الملف
        data[interaction.user.id].channelPrivacy = "chatClosed";  // حفظ الحالة
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        const chatClosed = new EmbedBuilder()
        .setColor("White")
        .setImage('https://e.top4top.io/p_3236d5htv1.png')
        .setDescription(`# Updated! \n <#${userVoiceData.voiceChannelId}> Channel is now **chat Closed**.\n \n `)
        .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
        await collected.update({
          embeds:[chatClosed],
          components: [], // إخفاء السيلكت بعد تحديث الرسالة
        });
      }
    } else {
      await interaction.followUp({
        content: "تم تجاوز المهلة الزمنية، يرجى المحاولة مجددًا.",
        ephemeral: true,
      });
    }
  },
};
