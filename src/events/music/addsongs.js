const { DistubeEmbedMessage } = require('../../utils/functions/function');
const BEV = require("@utils/types/baseEvents");

/** @type {BEV.BaseEvent<"songAdd">} */
module.exports = {
  name: "songAdd",
  /**
   * الحدث الذي يتم تنفيذه عند إضافة أغنية إلى قائمة الانتظار
   * @param {Object} client - كائن العميل الخاص بالبوت
   * @param {Object} queue - كائن يمثل قائمة الانتظار
   * @param {Object} song - كائن يمثل الأغنية المضافة
   */
  async execute(client, queue, song) {
    let songs = {
      title: "Add To Queue",
      desc: `${queue.name}`,
    };

    try {
      // استدعاء الدالة لإرسال رسالة مضمنة
      DistubeEmbedMessage(client, songs);
    } catch (error) {
      // التعامل مع أي أخطاء أثناء تنفيذ الكود
      console.error("Distube Error: ", error);
    }
  }
};
