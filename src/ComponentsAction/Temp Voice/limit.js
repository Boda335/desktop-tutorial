// Import necessary classes from discord.js
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

/**
 * @type {import("@utils/types/baseComponent")}
 */
module.exports = {
  // Component configuration
  name: "limit",
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

    // إنشاء مودال لتغيير الـ limit (الحد الأقصى للأعضاء)
    const modal = new ModalBuilder()
      .setCustomId("LIMIT")
      .setTitle("CHOOSE A LIMIT FOR YOUR VOICE CHANNEL");

    // إضافة حقل نصي للمودال لطلب العدد الجديد للأعضاء
    const userLimitInput = new TextInputBuilder()
        .setMaxLength(2)
        .setMinLength(1)
      .setCustomId("newUserLimit")
      .setLabel("New User limit")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);  // السماح بأن يكون الحقل فارغًا

    // وضع الحقل داخل صف
    const actionRow = new ActionRowBuilder().addComponents(userLimitInput);
    modal.addComponents(actionRow);

    // إظهار المودال
    await interaction.showModal(modal);

    // انتظار رد المستخدم
    const submitted = await interaction.awaitModalSubmit({
      filter: (i) => i.customId === "LIMIT" && i.user.id === interaction.user.id,
      time: 60000,
    }).catch(() => null);

    if (submitted) {
      // الحصول على العدد الجديد من المودال (إذا تم إدخاله)
      const newUserLimit = submitted.fields.getTextInputValue("newUserLimit");

      if (newUserLimit && isNaN(newUserLimit)) {
        await submitted.reply({
          content: "The input must be an integer only.",
          ephemeral: true
        });
        return;
      }
      if (!newUserLimit) {
        const channel = await client.channels.fetch(userVoiceData.voiceChannelId).catch(() => null);
        if (channel) {
          await channel.setUserLimit(0); // إزالة الحد الأقصى
          data[interaction.user.id].userLimit = 0;
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          const update = new EmbedBuilder()
          .setColor('White')
          .setImage('https://e.top4top.io/p_3236d5htv1.png')
          .setDescription(`# Updated! \n Your channel’s user limit is now **0**. `)
          .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
          // إرسال رسالة تأكيد للمستخدم
          await submitted.reply({
            embeds:[update],
            ephemeral: true
          });
        }
      } else {

        // جلب القناة من السيرفر وتغيير الحد الأقصى للأعضاء
        const channel = await client.channels.fetch(userVoiceData.voiceChannelId).catch(() => null);
        if (channel) {
          await channel.setUserLimit(parseInt(newUserLimit));

          // تحديث الـ limit في بيانات الملف
          data[interaction.user.id].userLimit = newUserLimit;
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          const dn = new EmbedBuilder()
          .setColor('White')
          .setImage('https://e.top4top.io/p_3236d5htv1.png')
          .setDescription(`# Updated! \n Your channel’s user limit is now **${newUserLimit}** `)
          .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
          // إرسال رسالة تأكيد للمستخدم
          await submitted.reply({
            embeds:[dn],
            ephemeral: true
          });
        } else {
          await submitted.reply({
            content: "لم أتمكن من العثور على قناتك الصوتية. قد تكون قد حُذفت.",
            ephemeral: true
          });
        }
      }
    }
  },
};
