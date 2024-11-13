// Import necessary classes from discord.js
const { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");

/**
 * @type {import("@utils/types/baseComponent")}
 */
module.exports = {
  // Component configuration
  name: "rename",
  enabled: true,

  // Action to perform when the button is clicked
  async action(client, interaction, parts) {
    // تحديد مسار الملف بشكل يدوي
    const filePath = path.join(__dirname, "..", "..", "events", "temp-voice", "userVoiceData.json");
    // قراءة البيانات الحالية من الملف
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
    // التحقق إذا كان لدى المستخدم قناة صوتية مسجلة
    const userVoiceData = data[interaction.user.id];
    if (!userVoiceData || !userVoiceData.voiceChannelId) {
      // إذا لم تكن هناك قناة مسجلة للمستخدم، إخباره بذلك
      return interaction.reply({
        embeds: [nov],
        ephemeral: true
      });
    }

    // إنشاء مودال لإعادة تسمية القناة
    const modal = new ModalBuilder()
      .setCustomId("renameVoiceChannelModal")
     .setTitle(`${client.user.username}`);

    // إضافة حقل نصي للمودال لطلب الاسم الجديد للقناة
    const channelNameInput = new TextInputBuilder()
      .setCustomId("newChannelName")
      .setLabel("CHOOSE A NAME FOR YOUR VOICE CHANNEL")
      .setPlaceholder('Leave blank to reset the name')
      .setStyle(TextInputStyle.Short)
      .setRequired(false); // جعل الحقل غير إجباري

    // وضع الحقل داخل صف
    const actionRow = new ActionRowBuilder().addComponents(channelNameInput);
    modal.addComponents(actionRow);

    // إظهار المودال
    await interaction.showModal(modal);

    // انتظار رد المستخدم
    const submitted = await interaction.awaitModalSubmit({
      filter: (i) => i.customId === "renameVoiceChannelModal" && i.user.id === interaction.user.id,
      time: 60000,
    }).catch(() => null);

    if (submitted) {
      // الحصول على الاسم الجديد من المودال
      let newChannelName = submitted.fields.getTextInputValue("newChannelName").trim();

      // إذا لم يتم إدخال اسم، استخدم الاسم الافتراضي
      if (!newChannelName) {
        newChannelName = `${interaction.member.displayName}'s Channel`;
      }

      // جلب القناة من السيرفر وتغيير اسمها
      const channel = await client.channels.fetch(userVoiceData.voiceChannelId).catch(() => null);
      if (channel) {
        await channel.setName(newChannelName);

        // تحديث اسم القناة في بيانات الملف
        data[interaction.user.id].voiceChannelname = newChannelName;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        const updatedEmbed = new EmbedBuilder()
        .setColor("White")
        .setImage('https://e.top4top.io/p_3236d5htv1.png')
        .setDescription(`# Updated!\n Your channel’s name is now: **${newChannelName}**`)
        .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
          await submitted.reply({
          embeds:[updatedEmbed],
          ephemeral: true
        });
      } else {
        // في حالة عدم العثور على القناة
        await submitted.reply({
          content: "لم أتمكن من العثور على قناتك الصوتية. قد تكون قد حُذفت.",
          ephemeral: true
        });
      }
    }
  },
};
