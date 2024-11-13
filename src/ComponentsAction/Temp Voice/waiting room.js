const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

/**
 * @type {import("@utils/types/baseComponent")}
 */
module.exports = {
  // Component configuration
  name: "w8",
  enabled: true,

  // Action to perform when the button is clicked
  async action(client, interaction, parts) {
    // تحديد مسار الملف الذي يحتوي على بيانات القنوات الصوتية للمستخدمين
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
    const userVoiceData = data[interaction.user.id];
    if (!userVoiceData || !userVoiceData.voiceChannelId) {
      return interaction.reply({
        embeds: [nov],
        ephemeral: true
      });
    }

    // جلب القناة الصوتية الحالية للمستخدم
    const currentVoiceChannel = await client.channels.fetch(userVoiceData.voiceChannelId).catch(() => null);
    if (!currentVoiceChannel) {
      return interaction.reply({
        content: "لم أتمكن من العثور على قناتك الصوتية. قد تكون قد حُذفت.",
        ephemeral: true
      });
    }
    
    const existingWaitingChannel = await client.channels.fetch(userVoiceData.waitingVoiceChannelId).catch(() => null);
    const alre = new EmbedBuilder()
      .setColor("White")
      .setImage('https://e.top4top.io/p_3236d5htv1.png')
      .setDescription(`# Not Possible! \n A waiting room has already been created for this temporary voice channel <#${existingWaitingChannel ? existingWaitingChannel.id : 'N/A'}>.`)
      .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
    
    // التحقق من وجود قناة الانتظار بالفعل
    if (userVoiceData.waitingVoiceChannelId) {
      if (existingWaitingChannel) {
        return interaction.reply({
          embeds: [alre],
          ephemeral: true
        });
      }
    }

    // إنشاء غرفة صوتية جديدة تحت القناة الحالية
    const newChannelName = `Ask ${interaction.user.globalName} to join`; // اسم القناة الجديدة
    const newVoiceChannel = await currentVoiceChannel.guild.channels.create({
      name: newChannelName,
      type: 2, // نوع القناة: Voice Channel
      parent: currentVoiceChannel.parent, // وضع الغرفة الجديدة تحت نفس الفئة التي تحتها القناة الحالية
      reason: `Room created for ${interaction.user.username}`,
    }).catch(() => null);

    if (!newVoiceChannel) {
      return interaction.reply({
        content: "فشل إنشاء القناة الصوتية الجديدة.",
        ephemeral: true
      });
    }

    // تحديث بيانات الملف لتشمل القناة الصوتية الجديدة
    data[interaction.user.id].waitingVoiceChannelId = newVoiceChannel.id;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    const dn = new EmbedBuilder()
      .setColor("White")
      .setImage('https://e.top4top.io/p_3236d5htv1.png')
      .setDescription(`# Created! \n A waiting room has been created for this channel <#${newVoiceChannel.id}>.`)
      .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
    
    await interaction.reply({
      embeds: [dn],
      ephemeral: true
    });
  },
};
