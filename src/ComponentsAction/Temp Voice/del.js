const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

/**
 * @type {import("@utils/types/baseComponent")}
 */
module.exports = {
  // Component configuration
  name: "del",
  enabled: true,

  // Action to perform when the button is clicked
  async action(client, interaction, parts) {

    // مسار ملف البيانات
    const filePath = path.join(__dirname, "..", "..", "events", "temp-voice", "userVoiceData.json");

    let data = {};
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath);
      data = JSON.parse(fileContent);
    }

    // الحصول على بيانات المستخدم
    const userVoiceData = data[interaction.user.id];
    
    // تحقق إذا كان المستخدم يملك قناة صوتية مسجلة
    if (!userVoiceData || !userVoiceData.voiceChannelId) {
      return interaction.followUp({
        content: "لا يوجد قناة صوتية مسجلة لحذفها.",
        ephemeral: true
      });
    }

    // الحصول على القناة الصوتية باستخدام الـ ID
    const voiceChannel = interaction.guild.channels.cache.get(userVoiceData.voiceChannelId);

    // تحقق إذا كانت القناة موجودة
    if (!voiceChannel) {
      return interaction.followUp({
        content: "القناة الصوتية لا توجد في الخادم.",
        ephemeral: true
      });
    }

    // الحصول على قناة الانتظار (إذا كانت موجودة)
    const waitingChannelId = userVoiceData.waitingVoiceChannelId;
    if (waitingChannelId) {
      const waitingChannel = await interaction.guild.channels.fetch(waitingChannelId).catch(() => null);
      if (waitingChannel) {
        // حذف قناة الانتظار إذا كانت موجودة
        await waitingChannel.delete().catch(err => {
          console.error(err);
          return interaction.followUp({
            content: "حدث خطأ أثناء محاولة حذف قناة الانتظار.",
            ephemeral: true
          });
        });
      }
    }

    // حذف القناة الصوتية من الخادم
    await voiceChannel.delete().catch(err => {
      console.error(err);
      return interaction.followUp({
        content: "حدث خطأ أثناء محاولة حذف القناة الصوتية.",
        ephemeral: true
      });
    });

    // مسح بيانات المستخدم بالكامل من الملف
    delete data[interaction.user.id];

    // حفظ البيانات بعد مسح المستخدم
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // تحديث الـ embed ليعرض حالة العملية بعد حذف القناة الصوتية
    const embed = new EmbedBuilder()
      .setDescription("# Closed! \n Your temporary voice channel and waiting room have been closed.")
      .setImage('https://e.top4top.io/p_3236d5htv1.png')
      .setColor('White')
      .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });

    // تحديث الـ embed الموجود عند التفاعل
    await interaction.update({
      embeds:[embed],
      components: []  // إزالة الأزرار بعد التفاعل
    });
  },
};
