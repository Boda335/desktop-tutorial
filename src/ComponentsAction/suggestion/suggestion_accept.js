const { ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

/**
 * @type {import("@utils/types/baseComponent")}
 */
module.exports = {
  name: "accept",
  enabled: true,

  // Action to perform when the button is clicked
  async action(client, interaction, parts) {
    try {
// استرجاع البيانات المخزنة في قاعدة البيانات
const guildData = await client.db.get(`${interaction.guildId}`);

// التأكد من وجود بيانات الـ suggestion_channel في قاعدة البيانات
const suggestionChannelData = guildData ? guildData.suggestion_channel : null;

// التحقق من أن البيانات موجودة في قاعدة البيانات
if (!suggestionChannelData) {
  return await interaction.reply({
    content: "بيانات الإعداد غير موجودة في قاعدة البيانات.",
    ephemeral: true,
  });
}

// استرجاع الرول المخزن من قاعدة البيانات
const requiredRoleId = suggestionChannelData.roleId;  // إذا كان موجودًا في suggestion_channel

// التحقق من أن المستخدم لديه الرول المناسب
if (!interaction.member.roles.cache.has(requiredRoleId)) {
  return await interaction.reply({
    content: "لا يمكنك استخدام هذا التفاعل لأنك لا تمتلك الرول المناسب.",
    ephemeral: true,
  });
}


      // إنشاء المودال الذي يحتوي على حقل نصي لكتابة السبب
      const modal = new ModalBuilder()
        .setCustomId('acceptModal')  // تحديد معرف المودال
        .setTitle('سبب القبول')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('acceptReason')  // تحديد معرف الحقل النصي
              .setLabel('الرجاء إدخال سبب القبول')  // النص الذي يظهر للمستخدم
              .setStyle(TextInputStyle.Paragraph)  // حقل نصي من نوع فقرة
              .setRequired(true)  // جعل الحقل إلزامي
              .setMaxLength(500)  // تحديد الحد الأقصى لعدد الأحرف
          )
        );

      // فتح المودال
      await interaction.showModal(modal);

      // الانتظار لاستلام الرد من المودال
      const modalInteraction = await interaction.awaitModalSubmit({
        time: 60000, // الانتظار لمدة دقيقة واحدة فقط
        filter: (i) => i.user.id === interaction.user.id,  // التحقق من أن المستخدم الذي يفتح المودال هو نفس من نقر على الزر
      });

      // الحصول على السبب المدخل من المودال
      const reason = modalInteraction.fields.getTextInputValue('acceptReason');

      // إرسال رد فوري للمستخدم بعد تقديم السبب
      if (!modalInteraction.replied) { // تحقق من أن التفاعل لم يُرد عليه من قبل
        await modalInteraction.reply({
          content: 'تم قبول الاقتراح بنجاح',
          ephemeral: true,
        });
      }

      // الحصول على الـ Embed الأصلي
      const originalEmbed = interaction.message.embeds[0];
      
      if (!originalEmbed) {
        throw new Error("الـ Embed غير موجود في الرسالة الأصلية");
      }

      // الحصول على منشن صاحب الـ Embed

      // إنشاء Embed جديد بدون حقل "الحالة"
      const updatedEmbed = new EmbedBuilder()
        .setTitle(originalEmbed.title)  // نقل العنوان الأصلي
        .setDescription(originalEmbed.description)  // نقل الوصف الأصلي
        .setColor(0x03bf00)  // نقل اللون الأصلي
        .setFooter(originalEmbed.footer)  // نقل التذييل الأصلي
        .setTimestamp(new Date());  // تأكد من أن الوقت هو كائن Date

      // نقل الثبنايل (thumbnail)
      if (originalEmbed.thumbnail) {
        updatedEmbed.setThumbnail(originalEmbed.thumbnail.url);
      }

      // إزالة حقل "الحالة" من الـ Embed الجديد إذا كان موجودًا
      if (updatedEmbed.fields) {
        updatedEmbed.fields = updatedEmbed.fields.filter(field => field.name !== 'الحالة');
      }

      // إضافة الحقل الجديد (السبب)
      updatedEmbed.addFields(
        { name: 'تم القبول', value: `${reason}`, inline: true }
      );

      // إضافة منشن لصاحب الـ Embed في الـ content
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setEmoji('💡')
            .setCustomId('btn')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
        );

      // تعديل الرسالة لتشمل منشن صاحب الـ Embed
      await interaction.message.edit({
        embeds: [updatedEmbed],
        components: [row],
      });

    } catch (error) {
      console.error(error);
      // إضافة رد عند حدوث خطأ
      if (!interaction.replied) {
        await interaction.reply({ content: 'حدث خطأ أثناء تنفيذ هذا الأمر!', ephemeral: true });
      }
    }
  },
};
