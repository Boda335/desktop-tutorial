const { ApplicationCommandOptionType, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * @type {import("@utils/types/baseCommand")}
 */
module.exports = {
  name: "setup",
  description: "setup radio channel",
  category: "ADMIN",
  botPermissions: [""],
  userPermissions: ["ManageChannels"],
  cooldown: 1000,
  command: {
    enabled: false,
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "suggestion",
        description: "to setup suggestion channel",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "Select the text channel for suggestions",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "emoji1",
            description: "The first emoji for reactions",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "emoji2",
            description: "The second emoji for reactions",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "role",
            description: "Select the role to be tagged",
            type: ApplicationCommandOptionType.Role,
            required: true,
          }
        ],
      },
      {
        name: "temp-voice",
        description: "to setup temporary voice and text channels",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async interactionExecute(client, interaction, lang) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const config = require('../../../config.json');
      if (subcommand === "suggestion") {
        const channel = interaction.options.getChannel("channel");
        const emoji1 = interaction.options.getString("emoji1");
        const emoji2 = interaction.options.getString("emoji2");
        const role = interaction.options.getRole("role");

        // الحصول على البيانات الحالية من قاعدة البيانات
        const existingData = await client.db.get(`${interaction.guildId}`);

        // إذا كانت البيانات غير موجودة، قم بإنشاء كائن جديد
        const updatedData = {
          suggestion_channel: {
            ...existingData?.suggestion_channel, // الاحتفاظ بالبيانات القديمة إذا كانت موجودة
            channelid: channel.id,
            emoji1: emoji1,
            emoji2: emoji2,
            roleId: role.id,
          },
          temp_channels: existingData?.temp_channels || {} // الاحتفاظ بالقنوات المؤقتة إذا كانت موجودة
        };

        // حفظ البيانات المحدثة في قاعدة البيانات
        await client.db.set(`${interaction.guildId}`, updatedData);

        // رد تأكيدي
        const embed = new EmbedBuilder()
          .setTitle("Suggestion Setup")
          .setDescription(`تم إعداد القناة بنجاح! 
          - القناة: ${channel}
          - الإيموجي الأول: ${emoji1}
          - الإيموجي الثاني: ${emoji2}
          - الرتبة: ${role}`)
          .setColor("Green");

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else if (subcommand === "temp-voice") {
        // إنشاء فئة جديدة (category)
        const category = await interaction.guild.channels.create({
          name: "TEMPVOICE CATEGORY",
          type: ChannelType.GuildCategory,
        });

        // إنشاء القناة النصية تحت الفئة
        const textChannel = await interaction.guild.channels.create({
          name: "✨・interface",
          type: ChannelType.GuildText,
          parent: category.id,
        });

        // إنشاء القناة الصوتية تحت الفئة
        const voiceChannel = await interaction.guild.channels.create({
          name: "➕ Creator Channel",
          type: ChannelType.GuildVoice,
          parent: category.id,
        });

        // حفظ البيانات في قاعدة البيانات
        const tempVoiceData = {
          text_channel: textChannel.id,
          voice_channel: voiceChannel.id,
          category_id: category.id,
        };

        const existingTempData = await client.db.get(`${interaction.guildId}`);
        const updatedTempData = {
          ...existingTempData,
          temp_channels: tempVoiceData, // إضافة القنوات المؤقتة إلى البيانات القديمة
        };

        await client.db.set(`${interaction.guildId}`, updatedTempData);
        
        // إرسال Embed إلى القناة النصية
        const embed = new EmbedBuilder()
          .setTitle("TempVoice Interface")
          .setDescription(`This **interface** can be used to manage temporary voice channels. More options are available with /voice commands.`)
          .setImage('https://e.top4top.io/p_323610npe1.png')
          .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() })
          .setColor('White');
        const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setEmoji(config.tempVemoji.rename)
          .setCustomId('rename')
          .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
          .setEmoji(config.tempVemoji.limit)
          .setCustomId('limit')
          .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
          .setEmoji(config.tempVemoji.privacy)
          .setCustomId('privcy')
          .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
          .setEmoji(config.tempVemoji.waitingr)
          .setCustomId('w8')
          .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
          .setEmoji(config.tempVemoji.theard)
          .setCustomId('thread')
          .setStyle(ButtonStyle.Secondary),
        )
        const row2 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setEmoji(config.tempVemoji.trust)
          .setCustomId('trust')
          .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
          .setEmoji(config.tempVemoji.untrust)
          .setCustomId('untrust')
          .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
          .setEmoji(config.tempVemoji.invite)
          .setCustomId('invite')
          .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
          .setEmoji(config.tempVemoji.kick)
          .setCustomId('kick')
          .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
          .setEmoji(config.tempVemoji.region)
          .setCustomId('region')
          .setStyle(ButtonStyle.Secondary),
        )
        const row3 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setEmoji(config.tempVemoji.block)
          .setCustomId('block')
          .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
          .setEmoji(config.tempVemoji.unblock)
          .setCustomId('unblock')
          .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
          .setEmoji(config.tempVemoji.claim)
          .setCustomId('claim')
          .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
          .setEmoji(config.tempVemoji.transfer)
          .setCustomId('transfer')
          .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
          .setEmoji(config.tempVemoji.delete)
          .setCustomId('delete')
          .setStyle(ButtonStyle.Secondary),
        )
        await textChannel.send({ embeds: [embed], components: [row,row2,row3] });

        const dn = new EmbedBuilder()
        .setColor('White')
        .setTitle('Setup Complete!')
        .setDescription(`${voiceChannel} can now be used to create temporary voice channels in your Discord server.`)
        .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
        await interaction.reply({ embeds: [dn], ephemeral: true });
      }
    } catch (err) {
      console.log(err.message);
      await interaction.reply({ content: "حدث خطأ أثناء إعداد القنوات.", ephemeral: true });
    }
  },
};
