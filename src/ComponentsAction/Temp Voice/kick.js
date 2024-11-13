// Import necessary classes from discord.js
const { ButtonBuilder, ActionRowBuilder, EmbedBuilder, SelectMenuBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require('../../../config.json');

/**
 * @type {import("@utils/types/baseComponent")}
 */
module.exports = {
  // Component configuration
  name: "kick",
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
      .setDescription(`# No Valid Channel! \nYou are not in a valid temporary voice channel. Join a **Creator Channel** first:\n \n <#${voiceChannelId}>`)
      .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
    // التحقق إذا كان لدى المستخدم قناة صوتية مسجلة
    const userVoiceData = data[interaction.user.id];
    if (!userVoiceData || !userVoiceData.voiceChannelId) {
      return interaction.reply({
        embeds: [nov],
        ephemeral: true
      });
    }

    // جلب القناة الصوتية للمستخدم
    const voiceChannel = await client.channels.fetch(userVoiceData.voiceChannelId).catch(() => null);
    if (!voiceChannel) {
      return interaction.reply({
        content: "لم أتمكن من العثور على قناتك الصوتية.",
        ephemeral: true
      });
    }

    // الحصول على جميع الأعضاء في القناة الصوتية مع استثناء صاحب القناة
    const membersInVoice = voiceChannel.members.filter(member => !member.user.bot && member.id !== interaction.user.id); // استبعاد صاحب الفويس

    const nomem = new EmbedBuilder()
    .setColor('White')
    .setDescription('# Not Possible! \nIt seems there are no members to be kicked')
    .setImage('https://e.top4top.io/p_3236d5htv1.png')
    .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });

    if (membersInVoice.size === 0) {
      return interaction.reply({
        embeds:[nomem],
        ephemeral: true
      });
    }

    // بناء select menu مع جميع الأعضاء
    const selectMenu = new SelectMenuBuilder()
      .setCustomId('kickMember')
      .setPlaceholder('The selected user will be kicked')
      .setMinValues(1)
      .setMaxValues(membersInVoice.size)
      .addOptions(
        membersInVoice.map(member => ({
          label: member.user.username,
          emoji: config.tempVemoji.kick,
          value: member.id,
        }))
      );

    // إرسال السيلكت للمستخدم (هنا الرد الأول)
    await interaction.reply({
      components: [new ActionRowBuilder().addComponents(selectMenu)],
      ephemeral: true
    });

    // انتظار رد المستخدم على السيلكت
    const filter = (i) => i.customId === 'kickMember' && i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000, // تحديد وقت جمع التفاعل (60 ثانية كمثال)
    });
    collector.on('collect', async (i) => {
      if (i.customId === 'kickMember') {
        // جلب جميع الأعضاء الذين تم اختيارهم
        const memberIds = i.values;
        
        // تحضير الرسالة للإشارة إلى الأعضاء الذين تم طردهم
        const kicked = new EmbedBuilder()
          .setColor('White')
          .setDescription(`# Kicked!\n The following users have been kicked out of your temporary voice channel:\n**${memberIds.map(id => `<@${id}>`).join('\n')}**`)
          .setImage('https://e.top4top.io/p_3236d5htv1.png')
          .setFooter({ text: 'Powered By Nexus System', iconURL: client.user.displayAvatarURL() });
    
        // محاولة إخراج الأعضاء
        for (const memberId of memberIds) {
          const memberToKick = voiceChannel.members.get(memberId);
    
          if (memberToKick) {
            await memberToKick.voice.disconnect(); // إخراج العضو من القناة الصوتية
          }
        }
    
        // تعديل الرسالة باستخدام editReply بعد الرد الأولي
        await i.update({
          embeds: [kicked],
          components: []  // إزالة السيلكت
        });
    
        collector.stop();
      }
    });
    
    
    collector.on('end', (collected, reason) => {
      if (reason === 'user') {
        return; 
      }
    
      // إذا انتهت الفترة الزمنية
      interaction.followUp({
        content: "انتهت فترة التفاعل مع السيلكت.",
        ephemeral: true,
      });
    });
  },
};
