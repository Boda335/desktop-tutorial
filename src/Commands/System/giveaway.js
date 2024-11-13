const {
  ApplicationCommandOptionType,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const ms = require("ms");
const { hostname } = require("os");
const messages = require("../../utils/functions/message");
/**
 * @type {import("@utils/types/baseCommand")}
 */
module.exports = {
  name: "giveaway",
  description: "To Start a Giveaway",
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
        name: "start",
        description: "to Start a giveaway",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "duration",
            description:
              "How long the giveaway should last for. Example values: 1m, 1h, 1d",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "winners",
            description: "How many winners the giveaway should have",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
          {
            name: "prize",
            description: "What the prize of the giveaway should be",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "channel",
            description: "The channel to start the giveaway in",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
          {
            name: "bonusrole",
            description: "Role which would receive bonus entries",
            type: ApplicationCommandOptionType.Role,
            required: false,
          },
          {
            name: "bonusamount",
            description: "The amount of bonus entries the role will receive",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
          {
            name: "invite",
            description:
              "Invite of the server you want to add as giveaway joining requirement",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
          {
            name: "role",
            description: "Role you want to add as giveaway joining requirement",
            type: ApplicationCommandOptionType.Role,
            required: false,
          },
        ],
      },
      {
        name: "resume",
        description: "Resume a paused giveaway",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "giveaway",
            description: "To Resume a Paused Giveaway",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "reroll",
        description: "rerolls one new winner from a giveaway",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "giveaway",
            description: "To reroll a Giveaway",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "pause",
        description: "To Pause a Giveaway",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "giveaway",
            description: "The giveaway to pause (message ID or giveaway prize)",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "end",
        description: "To end a Giveaway",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "giveaway",
            description: "The giveaway to end (message ID or giveaway prize)",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "delete",
        description: "Delete a giveaway by message ID",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "giveaway",
            description: "The message ID of the giveaway to delete",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async interactionExecute(client, interaction, lang) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const config = require("../../../config.json");

      if (subcommand === "start") {
        const giveawayChannel =
          interaction.options.getChannel("channel") || interaction.channel; // استخدم القناة الحالية إذا لم يتم تحديد قناة
        const giveawayDuration = interaction.options.getString("duration");
        const giveawayWinnerCount = interaction.options.getInteger("winners");
        const giveawayHosted = `<@${interaction.user.id}>`;
        const giveawayPrize = interaction.options.getString("prize");

        const duration = new EmbedBuilder()
          .setColor("White")
          .setTitle(
            `${config.emoji.worng2} **Please select a valid duration!**`
          );
        if (isNaN(ms(giveawayDuration))) {
          return interaction.reply({
            embeds: [duration],
            ephemeral: true,
          });
        }

        const winner = new EmbedBuilder()
          .setColor("White")
          .setTitle(
            `${config.emoji.worng2} **Please select a valid winner count! greater or equal to one.**`
          );
        if (giveawayWinnerCount < 1) {
          return interaction.reply({
            embeds: [winner],
            ephemeral: true,
          });
        }
        const bonusRole = interaction.options.getRole("bonusrole");
        const bonusEntries = interaction.options.getInteger("bonusamount");
        let rolereq = interaction.options.getRole("role");
        let invite = interaction.options.getString("invite");
        const bonus = new EmbedBuilder()
          .setColor("White")
          .setDescription(
            `${config.emoji.worng2} **You must specify how many bonus entries would ${bonusRole} receive!**`
          );

        if (bonusRole) {
          if (!bonusEntries) {
            return interaction.reply({
              embeds: [bonus],
              ephemeral: true,
            });
          }
        }

        await interaction.deferReply({ ephemeral: true });
        let reqinvite;
        if (invite) {
          let invitex = await client.fetchInvite(invite);
          let client_is_in_server = client.guilds.cache.get(invitex.guild.id);
          reqinvite = invitex;
          if (!client_is_in_server) {
            return interaction.editReply({
              embeds: [
                {
                  color: "White",
                  author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL,
                  },
                  title: "Server Check!",
                  description:
                    "Woah woah woah! I see a new server! Are you sure I am in that? You need to invite me there to set that as a requirement! 😳",
                  timestamp: new Date(),
                  footer: {
                    icon_url: client.user.avatarURL,
                    text: "Server Check",
                  },
                },
              ],
            });
          }
        }

        if (rolereq && !invite) {
          messages.inviteToParticipate = `**React with ${config.emoji.reaction} to participate!**\n>>> - Only members having ${rolereq} are allowed to participate in this giveaway!`;
        }
        if (rolereq && invite) {
          messages.inviteToParticipate = `**React with ${config.emoji.reaction} to participate!**\n>>> - Only members having ${rolereq} are allowed to participate in this giveaway!\n- Members are required to join [this server](${invite}) to participate in this giveaway!`;
        }
        if (!rolereq && invite) {
          messages.inviteToParticipate = `**React with ${config.emoji.reaction} to participate!**\n>>> - Members are required to join [this server](${invite}) to participate in this giveaway!`;
        }
        // start giveaway
        client.giveawaysManager.start(giveawayChannel, {
          duration: ms(giveawayDuration),
          prize: giveawayPrize,
          winnerCount: parseInt(giveawayWinnerCount),
          hostedBy: giveawayHosted,
          bonusEntries: [
            {
              // Members who have the role which is assigned to "rolename" get the amount of bonus entries which are assigned to "BonusEntries"
              bonus: new Function(
                "member",
                `return member.roles.cache.some((r) => r.name === \'${bonusRole?.name}\') ? ${bonusEntries} : null`
              ),
              cumulative: false,
            },
          ],
          // Messages
          messages,
          extraData: {
            server: reqinvite == null ? "null" : reqinvite.guild.id,
            role: rolereq == null ? "null" : rolereq.id,
          },
        });
        const dn = new EmbedBuilder()
          .setColor("White")
          .setTitle(
            `${config.emoji.check} **Giveaway started in ${giveawayChannel}**`
          );

        interaction.editReply({
          embeds: [dn],
          ephemeral: true,
        });

        if (bonusRole) {
          let giveaway = new EmbedBuilder()
            .setAuthor(`Bonus Entries Alert!`)
            .setDescription(
              `**${bonusRole}** Has **${bonusEntries}** Extra Entries in this giveaway!`
            )
            .setColor("White")
            .setTimestamp();
          giveawayChannel.send({ embeds: [giveaway] });
        }
      } else if (subcommand === "resume") {
        const query = interaction.options.getString("giveaway");
        // try to find the giveaway with prize alternatively with ID
        const giveaway =
          // Search with giveaway prize
          client.giveawaysManager.giveaways.find(
            (g) => g.prize === query && g.guildId === interaction.guild.id
          ) ||
          // Search with giveaway ID
          client.giveawaysManager.giveaways.find(
            (g) => g.messageId === query && g.guildId === interaction.guild.id
          );

        // If no giveaway was found
        if (!giveaway) {
          return interaction.reply({
            content: `Unable to find a giveaway for ${query}`,
            ephemeral: true,
          });
        }
        const notpsd = new EmbedBuilder()
          .setColor("White")
          .setDescription(
            `${config.emoji.warn} **[This giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})**  is not paused!`
          );
        if (!giveaway.pauseOptions.isPaused) {
          return interaction.reply({
            embeds: [notpsd],
            ephemeral: true,
          });
        }
        const resume = new EmbedBuilder()
          .setColor("White")
          .setDescription(
            `${config.emoji.check} **[This giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})** has been successfully resumed!`
          );
        client.giveawaysManager
          .unpause(giveaway.messageId)
          // Success message
          .then(() => {
            // Success message
            return interaction.reply({
              embeds: [resume],
              ephemeral: true,
            });
          });
      } else if (subcommand === "reroll") {
        const query = interaction.options.getString("giveaway");
        const giveaway =
          client.giveawaysManager.giveaways.find(
            (g) => g.prize === query && g.guildId === interaction.guild.id
          ) ||
          client.giveawaysManager.giveaways.find(
            (g) => g.messageId === query && g.guildId === interaction.guild.id
          );
        const nogiv = new EmbedBuilder()
          .setColor("White")
          .setTitle(
            `${config.emoji.worng2} Unable to find a giveaway for \`${query}\``
          );

        if (!giveaway) {
          return interaction.reply({
            embeds: [nogiv],
            ephemeral: true,
          });
        }

        const endd = new EmbedBuilder()
          .setColor("White")
          .setDescription(
            `[This Giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}) has not been ended yet`
          );

        if (!giveaway.ended) {
          return interaction.reply({
            embeds: [endd],
            ephemeral: true,
          });
        }
        const dn = new EmbedBuilder()
          .setColor("White")
          .setDescription(
            `${config.emoji.check} Rerolled **[this giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})!**`
          );

        client.giveawaysManager
          .reroll(giveaway.messageId, {
            messages: {
              congrat: `${config.emoji.reaction} **Congrats** {winners}!\n ${config.emoji.arrow} You Won **${giveaway.prize}**\n ${config.emoji.arrow} Rerolled By: <@${interaction.user.id}> `,
              error: "No valid participations, no new winner(s) can be chosen!",
            },
          })

          .then(() => {
            // Send an ephemeral message confirming the reroll
            interaction.reply({
              embeds: [dn],
              ephemeral: true, // Change to true if you want to keep this message private
            });
          });
      } else if (subcommand === "pause") {
        const query = interaction.options.getString("giveaway");
        const giveaway =
          client.giveawaysManager.giveaways.find(
            (g) => g.prize === query && g.guildId === interaction.guild.id
          ) ||
          client.giveawaysManager.giveaways.find(
            (g) => g.messageId === query && g.guildId === interaction.guild.id
          );

        const nogiv = new EmbedBuilder()
          .setColor("White")
          .setTitle(
            `${config.emoji.worng2} Unable to find a giveaway for '${query}'`
          );

        if (!giveaway) {
          return interaction.reply({
            embeds: [nogiv],
            ephemeral: true,
          });
        }

        const alpus = new EmbedBuilder()
          .setColor("White")
          .setDescription(
            `${config.emoji.warn} **[This giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})** is already paused`
          );

        // التحقق إذا كان السحب موقوفًا مسبقًا
        if (giveaway.pauseOptions.isPaused) {
          return interaction.reply({
            embeds: [alpus],
            ephemeral: true,
          });
        }

        const dnpus = new EmbedBuilder()
          .setColor("White")
          .setDescription(
            `**${config.emoji.check} [This giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})** has now been paused `
          );

        // تعليق السحب وتحديث خيارات العرض
        client.giveawaysManager
          .pause(giveaway.messageId, {
            isPaused: true,
            content: `${config.emoji.warn} **THIS GIVEAWAY IS PAUSED!** ${config.emoji.warn}`,
            unpauseAfter: null,
            embedColor: "White",
            infiniteDurationText: "`NEVER`",
          })
          .then(() => {
            // رسالة نجاح
            interaction.reply({
              embeds: [dnpus],
              ephemeral: true, // تأكد من تحديد خيارات ephemerable هنا إذا لزم الأمر
            });
          });
      } else if (subcommand === "end") {
        const query = interaction.options.getString("giveaway");
        // fetching the giveaway with message Id or prize
        const giveaway =
          // Search with giveaway prize
          client.giveawaysManager.giveaways.find(
            (g) => g.prize === query && g.guildId === interaction.guild.id
          ) ||
          client.giveawaysManager.giveaways.find(
            (g) => g.messageId === query && g.guildId === interaction.guild.id
          );
        const nog = new EmbedBuilder()
          .setColor("White")
          .setTitle(
            `${config.emoji.worng}Unable to find a giveaway for \`' + query + '\`.`
          );

        if (!giveaway) {
          return interaction.reply({
            embeds: [nog],
            ephemeral: true,
          });
        }
        const endd = new EmbedBuilder()
          .setColor("White")
          .setTitle(`${config.emoji.warning} This giveaway has already ended!`);
        if (giveaway.ended) {
          return interaction.reply({
            embeds: [endd],
            ephemeral: true,
          });
        }
        const endembd = new EmbedBuilder()
          .setColor("White")
          .setDescription(
            `**[This Giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}) Has Now Ended!**`
          );
        client.giveawaysManager
          .end(giveaway.messageId)
          // Success message
          .then(() => {
            // Success message
            interaction.reply({ embeds: [endembd], ephemeral: true });
          });
      } else if (subcommand === "delete") {
        const messageId = interaction.options.getString("giveaway");
        const giveaway = client.giveawaysManager.giveaways.find(
          (g) => g.messageId === messageId
        );
        const nogiv = new EmbedBuilder()
          .setColor("White")
          .setTitle(
            `${config.emoji.worng2} Giveaway not found for the provided message ID!`
          );
        if (!giveaway) {
          return interaction.reply({
            embeds: [nogiv],
            ephemeral: true,
          });
        }

        // حذف الجيف أواي من الداتا وإزالته من الديسكورد
        await client.giveawaysManager.delete(messageId);
        const delembed = new EmbedBuilder()
          .setColor("White")
          .setTitle(
            `${config.emoji.check}Giveaway with message ID \`${messageId}\` has been deleted successfully.`
          );
        interaction.reply({
          embeds: [delembed],
          ephemeral: true,
        });
      }
    } catch (err) {
      console.log(err);
    }
  },
};
