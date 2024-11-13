const { ChannelType, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "voiceStateUpdate",
  async execute(client, oldState, newState) {
    try {
      // تجاهل البوتات
      if (newState.member.user.bot) return;

      // تحديد مسار الملف الذي يحتوي على بيانات القنوات الصوتية للمستخدمين
      const filePath = path.join(__dirname, "userVoiceData.json");

      // قراءة البيانات من الملف (إن كانت موجودة)
      let data = {};
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath);
        data = JSON.parse(fileContent);
      }

      // البحث عن المستخدم في البيانات حسب قناة الانتظار
      const userData = Object.values(data).find(user => user.waitingVoiceChannelId === newState.channelId);
      
      // إذا لم يكن في قناة الانتظار، تجاهل التحديث
      if (!userData) {
        return;
      }

      // جلب القناة الصوتية الخاصة بالمستخدم
      const voiceChannel = await newState.guild.channels.fetch(userData.voiceChannelId).catch(err => {
        console.error("Error fetching voice channel:", err);
        return null;
      });
      const waitingVoiceChannelId = await newState.guild.channels.fetch(userData.waitingVoiceChannelId).catch(err => {
        console.error("Error fetching voice channel:", err);
        return null;
      });

      if (!voiceChannel) {
        console.log(`Voice channel not found for user: ${userData.voiceChannelId}`);
        return;
      }

      // جلب معرّف صاحب الغرفة من البيانات
      const ownerId = userData.ownerId;

      if (!ownerId) {
        console.error("No ownerId found for voice channel.");
        return;
      }

      // جلب عضو السيرفر الذي يملك القناة الصوتية
      const owner = await newState.guild.members.fetch(ownerId).catch(err => {
        console.error("Error fetching channel owner:", err);
        return null;
      });

      // إعداد SelectMenu للموافقة أو الرفض
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("voice_approval")
        .setPlaceholder(`${newState.member.user.globalName} wants to join your Channel`)

        .addOptions([
          {
            label: 'Allow',
            value: 'allow',
            description: 'Allow the user to join your voice channel.',
            emoji: '✅'
          },
          {
            label: 'Deny',
            value: 'deny',
            description: 'Deny the user from joining your voice channel.',
            emoji: '❌'
          }
        ]);

      // إرسال رسالة مع SelectMenu إلى صاحب القناة الصوتية
      const row = new ActionRowBuilder().addComponents(selectMenu);
        
      const message = await voiceChannel.send({
        content: `-# ${owner ? `<@${owner.id}>` : ""} - ${newState.member} - <#${waitingVoiceChannelId.id}>`,
        components: [row],
      });

      // التفاعل مع اختيارات صاحب القناة
      const filter = (interaction) => interaction.customId === "voice_approval";

      // تغيير الطريقة بحيث لا يوجد وقت محدود، ولن يتم إيقاف التفاعل إلا عند رد فعل صاحب القناة
      client.on('interactionCreate', async (interaction) => {
        if (!interaction.isStringSelectMenu()) return;
      
        // التأكد من أن التفاعل هو لصاحب القناة فقط
        if (interaction.customId === "voice_approval" && interaction.user.id === ownerId) {
          try {
            if (interaction.values[0] === 'allow') {
              await newState.member.voice.setChannel(voiceChannel);
            } else if (interaction.values[0] === 'deny') {
              await newState.member.voice.setChannel(null);
            }

            // محاولة حذف الرسالة مع التعامل مع الخطأ إذا كانت الرسالة غير موجودة
            try {
              await message.delete();
            } catch (deleteError) {
              if (deleteError.code !== 10008) { // تجاهل الخطأ إذا كانت الرسالة غير موجودة
                console.error("Error deleting message:", deleteError);
              }
            }
          } catch (error) {
            console.error("Error processing the interaction:", error);
          }
        } else {
          // إذا لم يكن المستخدم هو صاحب القناة الصوتية
          await interaction.reply({
            content: "You are not the owner of this voice channel, you cannot approve or deny the request.",
            ephemeral: true
          });
        }
      });

    } catch (error) {
      console.error("حدث خطأ أثناء التعامل مع القنوات الصوتية:", error);
    }
  }
};
