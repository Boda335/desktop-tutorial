const { ChannelType, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "voiceStateUpdate",
  async execute(client, oldState, newState) {
    try {
      if (newState.member.user.bot) return; // تجاهل البوتات

      // جلب بيانات السيرفر من قاعدة البيانات
      const guildData = await client.db.get(`${newState.guild.id}`);
      const tempVoiceChannelId = guildData?.temp_channels?.voice_channel;
      const filePath = path.join(__dirname, "userVoiceData.json");

      // قراءة البيانات الحالية من الملف (إذا كانت موجودة)
      let data = {};
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath);
        data = JSON.parse(fileContent);
      }

      // تحقق إذا كان المستخدم دخل إلى القناة الصوتية المؤقتة
      if (newState.channelId === tempVoiceChannelId) {
        const userSettings = data[newState.member.id] || {};
        
        // إنشاء مصفوفات trusted و untrusted إذا لم تكن موجودة
        if (!userSettings.trustrd) {
          userSettings.trustrd = [];
        }
        if (!userSettings.untrusted) {
          userSettings.untrusted = [];
        }

        // تحقق من قائمة untrusted لمنع المستخدم من إنشاء القناة إذا كان محظوراً
        if (userSettings.untrusted.includes(newState.member.id)) {
          await newState.member.voice.disconnect(); // فصل المستخدم إذا كان محظوراً
          return;
        }

        const channelName = userSettings.voiceChannelname || `${newState.member.displayName}'s Channel`;
        const userLimit = userSettings.userLimit || 0;

        // تعيين صلاحيات القناة للمستخدم
        const permissions = [
          ...userSettings.trustrd.map(userId => ({
            id: userId,
            allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
          })),
        ];

        // إنشاء قناة صوتية جديدة باستخدام الاسم والحد
        const newChannel = await newState.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildVoice,
          parent: guildData?.temp_channels?.category_id,
          userLimit: userLimit,
          permissionOverwrites: permissions,
        });

        // نقل المستخدم إلى القناة الجديدة
        await newState.member.voice.setChannel(newChannel);

        // تحديث البيانات وحفظها
        data[newState.member.id] = {
          ...data[newState.member.id],
          voiceChannelId: newChannel.id,
          voiceChannelname: newChannel.name,
          userLimit: newChannel.userLimit,
          trustrd: userSettings.trustrd,
          untrusted: userSettings.untrusted, // إضافة مصفوفة untrusted
          ownerId: newState.member.id, // إضافة ID صاحب القناة
        };

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      }

      // تحقق من مغادرة القناة وحذف القناة الصوتية
      if (oldState.channel && oldState.channel.members.size === 0) {
        const channel = oldState.channel;
        const isBotCreatedChannel = Object.values(data).some(user => user.voiceChannelId === channel.id);
      
        if (channel && channel.type === ChannelType.GuildVoice && isBotCreatedChannel) {
          try {
            const fetchedChannel = await client.channels.fetch(channel.id);
            if (fetchedChannel) {
              // حذف القناة الأساسية
              await fetchedChannel.delete();
              
              // البحث عن المستخدم الذي يملك هذه القناة وحذف القناة الانتظار الخاصة به إذا كانت موجودة
              for (const userId in data) {
                if (data[userId].voiceChannelId === channel.id) {
                  // إذا كان هناك Thread مرتبط بالقناة
                  if (data[userId].threadId) {
                    const thread = await client.channels.fetch(data[userId].threadId).catch(() => null);
                    if (thread) await thread.delete();
                    delete data[userId].threadId;
                  }
                  delete data[userId].voiceChannelId;
      
                  // حذف غرفة الانتظار إذا كانت موجودة
                  const waitingChannelId = data[userId]?.waitingVoiceChannelId;
                  if (waitingChannelId) {
                    const waitingChannel = await client.channels.fetch(waitingChannelId).catch(() => null);
                    if (waitingChannel) {
                      await waitingChannel.delete(); // حذف غرفة الانتظار
                      delete data[userId].waitingVoiceChannelId;
                    }
                  }
                  break;
                }
              }
              
              // حفظ البيانات بعد التعديل
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            }
          } catch (error) {
            // تجاهل الخطأ إذا كانت القناة غير موجودة
            if (error.code !== 10003) console.error("حدث خطأ أثناء محاولة حذف القناة:", error);
          }
        }
      }
      

      // تحقق إذا دخل البوت إلى غرفة الانتظار
      if (newState.channel && newState.channel.id === guildData?.temp_channels?.waiting_channel) {
        // جلب بيانات المستخدم صاحب القناة
        const userVoiceChannelId = data[newState.member.id]?.voiceChannelId;

        // التأكد أن المستخدم يملك قناة صوتية مرتبطة
        if (userVoiceChannelId) {
          const userVoiceChannel = await newState.guild.channels.fetch(userVoiceChannelId);

          if (userVoiceChannel) {
            // نقل البوت إلى قناة صاحب الغرفة
            await newState.member.voice.setChannel(userVoiceChannel);

            // إرسال منشن لصاحب القناة داخل القناته الصوتية
            await userVoiceChannel.send(`<@${newState.member.id}>، أنت في غرفة الانتظار، سيتم نقلك إلى قناتك الصوتية.`);
          }
        }
      }
    } catch (error) {
      console.error("حدث خطأ أثناء التعامل مع القنوات الصوتية:", error);
    }
  }
};
