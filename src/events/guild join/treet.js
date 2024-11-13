const { Collection,EmbedBuilder,ActionRowBuilder,ButtonBuilder,ButtonStyle } = require("discord.js");
const BEV = require("@utils/types/baseEvents");
const config = require('../../../config.json');
/** @type {BEV.BaseEvent<"guildCreate">} */
module.exports = {
  name: "guildCreate",
  async execute(client, guild) {
    try {
      // جلب سجلات التدقيق الخاصة بالسيرفر
      const auditLogs = await guild.fetchAuditLogs({
        limit: 1,
        actionType: 75 // القيمة الرقمية لإضافة بوت
      });

      // الحصول على السجل الأخير
      const log = auditLogs.entries.first();
      if (!log) return;

      // الحصول على الشخص الذي قام بدعوة البوت
      const inviter = log.executor;
      const treet = new EmbedBuilder()
      .setAuthor({ name: `${guild.name} `, iconURL: guild.iconURL() })
      .setColor('White')
      .setDescription(`Thank you for adding me to your server!
        ・ My default prefix is \`${config.prefix}\`
        ・ You can use the \`${config.prefix}\`help command to get list of commands 
        ・ Our documentation offers detailed information & guides for commands
        ・ Feel free to join our Support Server if you need help/support for anything related to the bot!
        `)
        .setImage('https://e.top4top.io/p_3236d5htv1.png')
        .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel('Support')
            .setStyle(ButtonStyle.Link)
            .setURL(config.NexusLink)
        )
      if (inviter) {
        inviter.send({ components:[row],embeds:[treet] });
      }

    } catch (error) {
      console.error(error);
    }
  }
}
