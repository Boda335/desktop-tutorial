const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { CommandHandler } = require('@src/handlers');
const BEV = require("@utils/types/baseEvents");

/** @type {BEV.BaseEvent<"messageCreate">} */
module.exports = {
  name: "messageCreate",
  async execute(client, message) {
    try {
      if (message.author.bot || !message.guild) return;

      // جلب معلومات القناة، والإيموجيين المسجلين من قاعدة البيانات
      const guildData = await client.db.get(`${message.guild.id}`);
      
      // التأكد من أن بيانات الاقتراحات موجودة في قاعدة البيانات
      const suggestionChannelData = guildData ? guildData.suggestion_channel : null;

      if (!suggestionChannelData) return; // إذا لم توجد بيانات الاقتراحات في قاعدة البيانات

      const registeredChannelId = suggestionChannelData.channelid;
      const emoji1 = suggestionChannelData.emoji1;
      const emoji2 = suggestionChannelData.emoji2;

      // تحقق من أن الرسالة في القناة المسجلة
      if (registeredChannelId && message.channel.id === registeredChannelId) {
        // حذف الرسالة الأصلية
        await message.delete();

        // إنشاء Embed يحتوي على محتوى الرسالة
        const embed = new EmbedBuilder()
          .setTitle('اقتراح جديد :pencil:')
          .setThumbnail(message.author.displayAvatarURL()) 
          .setDescription(`**الاقتراح :**\n\`\`\`${message.content}\`\`\``)
          .addFields({ name: 'الحالة', value: 'قيد الانتظار :hourglass_flowing_sand:', inline: true })
          .setFooter({ text: `تم الارسال بواسطة : ${message.author.tag}` })
          .setTimestamp()
          .setColor('#12cdde');

        // إعداد الأزرار
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('accept')
              .setLabel('قبول')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId('reject')
              .setLabel('رفض')
              .setStyle(ButtonStyle.Danger),
          );

        // إرسال الـ Embed في نفس القناة
        const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

        // إضافة الرياكشن باستخدام الإيموجيين المسجلين
        if (emoji1) await sentMessage.react(emoji1);
        if (emoji2) await sentMessage.react(emoji2);
      } else {
        // إذا كانت الرسالة في قناة أخرى، يتم التعامل معها كأمر عادي
        CommandHandler.handlePrefixCommand(client, message);
      }
    } catch (error) {
      console.error(error);
      message.reply({ content: 'حدث خطأ أثناء تنفيذ هذا الأمر!' });
    }
  }
};
