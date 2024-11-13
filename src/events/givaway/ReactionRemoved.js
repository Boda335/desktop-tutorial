const { emoji, embedcolor } = require('@root/config.json');
const Discord = require("discord.js");
const BEV = require("@utils/types/baseEvents");
const { EmbedBuilder } = require("discord.js");
const { config } = require('process');

/** @type {BEV.BaseEvent<"messageReactionRemove">} */
module.exports = {
  name: "messageReactionRemove",
  async execute(client, reaction, user) {
    try {
      // التأكد من أن المستخدم ليس بوتًا وأن الرسالة موجودة في سيرفر
      if (user.bot || !reaction.message.guild) return;

      // الحصول على المسابقة باستخدام giveawaysManager
      const giveaway = client.giveawaysManager.giveaways.find((g) => g.messageId === reaction.message.id);

      // إذا لم تكن الرسالة مرتبطة بمسابقة، أو المسابقة انتهت بالفعل، لا تفعل شيئًا
      if (!giveaway) return; // ليست مسابقة
      if (giveaway.ended) return; // المسابقة انتهت بالفعل

      // إرسال رسالة خاصة للعضو تعلمه بأنه أزال تفاعله
      await user.send({
        embeds: [new Discord.EmbedBuilder()
          .setTimestamp()
          .setTitle(`${emoji.warning} Hold Up! Did You Just Remove a Reaction From A Giveaway?`)
          .setColor("White")
          .setDescription(
            `Your entry to [This Giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}) was recorded, but you un-reacted. Since you don't need **${giveaway.prize}**, I would have to choose someone else 😭`
          )
        .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() })

        ]
      }).catch(e => {
        console.error("Error sending DM:", e); // تسجيل الخطأ إذا فشل إرسال الرسالة
      });

    } catch (error) {
      console.error("Error handling reaction remove:", error);
    }
  }
}
