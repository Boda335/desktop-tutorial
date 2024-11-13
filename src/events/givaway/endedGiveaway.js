const { emoji } = require('@root/config.json');
const BEV = require("@utils/types/baseEvents");

/** @type {BEV.BaseEvent<"messageReactionAdd">} */
module.exports = {
  name: "messageReactionAdd",
  async execute(client, reaction, user) {
    try {
      // التأكد من أن المستخدم ليس بوتًا وأن الرسالة موجودة في سيرفر
      if (user.bot || !reaction.message.guild) return;

      // استخدام giveawaysManager للتحقق مما إذا كانت الرسالة هي مسابقة
      const giveaway = client.giveawaysManager.giveaways.find((g) => g.messageId === reaction.message.id);

      // إذا لم تكن الرسالة مرتبطة بمسابقة، أو المسابقة لم تنته، لا تفعل شيئًا
      if (!giveaway) return; // ليست مسابقة
      if (!giveaway.ended) return; // المسابقة لم تنته

      // إذا انتهت المسابقة، قم بإزالة التفاعل وأرسل رسالة خاصة للمستخدم
      await reaction.users.remove(user.id);
      await user.send(`${emoji.warning} **Aw snap! Looks like that giveaway has already ended!**`).catch((e) => {
        console.error("Error sending DM:", e); // تسجيل الخطأ إذا فشل إرسال الرسالة
      });

    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  }
}
