const BEV = require("@utils/types/baseEvents");

/** @type {BEV.BaseEvent<"error">} */
module.exports = {
  name: "error",
  /**
   * الحدث الذي يتم تنفيذه عند حدوث خطأ
   * @param {Object} Channel - كائن يمثل القناة التي حدث فيها الخطأ
   * @param {Error} error - كائن يمثل الخطأ الذي وقع
   */
  async execute(Channel, error) {
    // عرض الخطأ في وحدة التحكم
    console.error("An error occurred:", error);
  }
};
