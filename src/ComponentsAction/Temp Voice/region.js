// Import necessary classes from discord.js
const { StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require('../../../config.json');
// قائمة المناطق المتاحة مع الوصف
const regions = {
  "Automatic": {
    value: "Auto", // القيمة التلقائية
    description: "تحديد المنطقة تلقائيًا بناءً على موقع المستخدم.",
    emoji: config.tempVemoji.region,
  },
  "Brazil": {
    value: "brazil",
    description: "منطقة البرازيل.",
    emoji: config.tempVemoji.region,
  },
  "Rotterdam": {
    value: "europe",
    description: "منطقة روتردام في أوروبا.",
    emoji: config.tempVemoji.region,
  },
  "Hong Kong": {
    value: "hongkong",
    description: "منطقة هونغ كونغ.",
    emoji: config.tempVemoji.region,
  },
  "India": {
    value: "india",
    description: "منطقة الهند.",
    emoji: config.tempVemoji.region,
  },
  "Korea": {
    value: "south-korea",
    description: "منطقة كوريا الجنوبية.",
    emoji: config.tempVemoji.region,
    
  },
  "Japan": {
    value: "japan",
    description: "منطقة اليابان.",
    emoji: config.tempVemoji.region,
  },
  "Russia": {
    value: "russia",
    description: "منطقة روسيا.",
    emoji: config.tempVemoji.region,
  },
  "Singapore": {
    value: "singapore",
    description: "منطقة سنغافورة.",
    emoji: config.tempVemoji.region,
  },
  "South Africa": {
    value: "southafrica",
    description: "منطقة جنوب أفريقيا.",
    emoji: config.tempVemoji.region,
  },
  "Sydney": {
    value: "sydney",
    description: "منطقة سيدني.",
    emoji: config.tempVemoji.region,
  },

  "US East": {
    value: "us-east",
    description: "منطقة الولايات المتحدة - الشرقية.",
    emoji: config.tempVemoji.region,
  },
  "US West": {
    value: "us-west",
    description: "منطقة الولايات المتحدة - الغربية.",
    emoji: config.tempVemoji.region,
  }
};
/**
 * @type {import("@utils/types/baseComponent")}
 */
module.exports = {
  // Component configuration
  name: "region",
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
      .setImage('https://e.top4top.io/p_3236d5htv1.png')
      .setDescription(`# No Valid Channel! \n You are not in a valid temporary voice channel. Join a **Creator Channel** first:\n \n <#${voiceChannelId}>`)
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

    // إنشاء قائمة الاختيارات مع المناطق والأوصاف
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select_region")
      .setPlaceholder("Choose a channel region")
      .addOptions(
        Object.entries(regions).map(([label, { value, description }]) => ({
          label , // تضمين الإيموجي المشترك مع الاسم
          value,
          emoji:config.tempVemoji.region,
          description
        }))
      );

    // إنشاء صف العمل لاحتواء قائمة الاختيارات
    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    // إرسال قائمة الاختيارات للمستخدم
    const message = await interaction.reply({
      components: [actionRow],
      ephemeral: true,
    });

    // الاستماع للتفاعل عند اختيار المستخدم للمنطقة
    const filter = (i) => i.customId === "select_region" && i.user.id === interaction.user.id;

    // التعامل مع التفاعل مباشرة
    interaction.channel.awaitMessageComponent({ filter, time: 15000 })
    .then(async (selectInteraction) => {
      const selectedRegion = selectInteraction.values[0];
  
      try {
        // التحقق مما إذا كان الاختيار هو "Auto" وتجاهل تغيير المنطقة في هذه الحالة
        if (selectedRegion === "Auto") {
          // إذا تم اختيار "Auto"، سيقوم ديسكورد بتحديد المنطقة تلقائيًا
          await interaction.member.voice.channel.edit({
            rtcRegion: null, // ترك الريجون فارغًا للتحديد التلقائي
          });
        } else {
          // تغيير المنطقة الصوتية للقناة الصوتية
          await interaction.member.voice.channel.edit({
            rtcRegion: selectedRegion,
          });
        }

          // تحديث الرسالة بعد تغيير المنطقة
          const updatedEmbed = new EmbedBuilder()
            .setColor("White")
            .setImage('https://e.top4top.io/p_3236d5htv1.png')
            .setDescription(`# Updated!\n <#${userVoiceData.voiceChannelId}>’s region is now **${selectedRegion}**`)
            .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });

          await selectInteraction.update({
            embeds: [updatedEmbed],
            components: [], // إزالة قائمة الاختيارات
          });
        } catch (error) {
          console.error("Error changing RTC region:", error);
          await selectInteraction.update({
            content: "An error occurred while trying to change the region.",
            components: [], // إزالة قائمة الاختيارات
          });
        }
      })
      .catch(() => {
        interaction.followUp({
          content: "You took too long to select a region. Please try again.",
          ephemeral: true,
        });
      });
  },
};
