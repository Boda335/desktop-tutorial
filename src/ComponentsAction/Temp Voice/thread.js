const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
module.exports = {
  name: "thread",
  enabled: true,

  async action(client, interaction, parts) {
    try {
        const filePath = path.join(__dirname, "..", "..", "events", "temp-voice", "userVoiceData.json");

        // قراءة البيانات الحالية من ملف userVoiceData
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
        // التحقق من أن المستخدم لديه قناة صوتية مسجلة
        const userVoiceData = data[interaction.user.id];
        if (!userVoiceData || !userVoiceData.voiceChannelId) {
          return interaction.reply({
            embeds: [nov],
            ephemeral: true
          });
        }

        // الحصول على بيانات السيرفر من قاعدة البيانات
        const guildData = await client.db.get(`${interaction.guild.id}`);
        const tempVoiceData = guildData ? guildData.temp_channels : null;

        // التحقق إذا كانت بيانات القناة النصية موجودة
        const textChannelId = tempVoiceData ? tempVoiceData.text_channel : null;
        if (!textChannelId) {
          return interaction.reply({
            content: "لم أتمكن من العثور على القناة النصية المناسبة.",
            ephemeral: true
          });
        }

        // استرجاع القناة النصية باستخدام ID
        const textChannel = await interaction.guild.channels.fetch(textChannelId);

        // إنشاء Thread جديد داخل القناة النصية المحددة
        const thread = await textChannel.threads.create({
          name: `${interaction.user.username}`, // اسم الروم النصي
          autoArchiveDuration: 60, // الوقت الذي سيتم فيه أرشفة الروم (دقيقة)
        });

        // إضافة صاحب الروم كعضو في الروم النصي
        await thread.members.add(interaction.user.id);

        // إضافة الـ thread ID إلى بيانات المستخدم في الكائن data
        if (!data[interaction.user.id]) {
          data[interaction.user.id] = {};
        }
        data[interaction.user.id].threadId = thread.id;

        // حفظ البيانات المعدلة في نفس الملف userVoiceData.json
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        const dn = new EmbedBuilder()
        .setColor("White")
        .setImage('https://e.top4top.io/p_3236d5htv1.png')
        .setDescription(`# Created!\n A temporary thread has been created for this channel.`)
        .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
        // إرسال رسالة تأكيد للمستخدم في القناة الأصلية
        await interaction.reply({
          embeds:[dn],
          ephemeral: true
        });
    } catch (err) {
      console.error(err.message);
      await interaction.reply({
        content: "حدث خطأ أثناء إنشاء الروم النصي.",
        ephemeral: true
      });
    }
  },
};
