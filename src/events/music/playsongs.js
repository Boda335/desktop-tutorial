const { DistubeEmbedMessage } = require('../../utils/functions/function');
const BEV = require("@utils/types/baseEvents");

/** @type {BEV.BaseEvent<"playSong">} */
module.exports = {
  name: "playSong",
  /**
   * الحدث الذي يتم تنفيذه عند بدء تشغيل أغنية جديدة
   * @param {Object} client - كائن العميل الخاص بالبوت
   * @param {Object} queue - كائن يمثل قائمة الانتظار الحالية
   * @param {Object} song - كائن يمثل الأغنية التي يتم تشغيلها حاليًا
   */
  async execute(client, queue, song) {
    const songs = {
      title: "Now Playing",
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
