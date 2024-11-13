// Import necessary classes from discord.js
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@utils/types/baseCommand")}
 */
module.exports = {
  name: "automod",
  description: "Configure the automod system.",
  category: "Admin",
  botPermissions: ["Administrator"],
  userPermissions: ["Administrator"],
  cooldown: 1000,
  command: { enabled: false, minArgsCount: 1 },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "flagged-words",
        description: "Block profanity, sexual content and slurs",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "spam-messages",
        description: "Block messages suspected of spam",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "mention-spam",
        description: "Anti spam for mentions",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "number",
            description: "The number of max mentions",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "keyword",
        description: "Block a given keyword in the server",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "word",
            description: "The word you want to block",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async msgExecute(client, message, args, lang) {
    try {
      // Function body if needed
    } catch (err) {
      console.log(err);
    }
  },

  async interactionExecute(client, interaction, lang) {
    try {
      const Subcommand = interaction.options.getSubcommand();
      const guild = interaction.guild;
      const options = interaction.options;

      switch (Subcommand) {
        case "flagged-words": {
          await interaction.reply({ content: `Loading your Automod rule...` });
          const rule = await guild.autoModerationRules.create({
            name: `Block profanity, sexual content, and slurs by ${client.user.username}`,
            creatorId: "1139143053387509840",
            enabled: true,
            eventType: 1,
            triggerType: 4,
            triggerMetadata: {
              presets: [1, 2, 3],
            },
            actions: [
              {
                type: 1,
                metadata: {
                  channel: interaction.channel,
                  durationSeconds: 10,
                  customMessage: `This message was prevented by ${client.user.username}`,
                },
              },
            ],
          }).catch(async (err) => {
            setTimeout(async () => {
              return;
            }, 2000);
          });

          setTimeout(async () => {
            if (!rule) return;

            const embed = new EmbedBuilder()
              .setColor("#2f3136")
              .setDescription(`Your automod rule has been created`)
              .setFooter({ text: `Automod Rule Created` });

            await interaction.editReply({
              content: "",
              embeds: [embed],
            });
          }, 3000);

          break;
        }

        case "keyword": {
          await interaction.reply({ content: `Loading your Automod rule...` });
          const word = options.getString("word");

          const rule2 = await guild.autoModerationRules.create({
            name: `Prevent the word ${word} by ${client.user.username}`,
            creatorId: "1139143053387509840",
            enabled: true,
            eventType: 1,
            triggerType: 1,
            triggerMetadata: {
              keywordFilter: [word],
            },
            actions: [
              {
                type: 1,
                metadata: {
                  channel: interaction.channel,
                  durationSeconds: 10,
                  customMessage: `This message was prevented by ${client.user.username}`,
                },
              },
            ],
          }).catch(async (err) => {
            setTimeout(async () => {
              return;
            }, 2000);
          });

          setTimeout(async () => {
            if (!rule2) return;

            const embed2 = new EmbedBuilder()
              .setColor("#2f3136")
              .setDescription(`Your automod rule has been created. Messages with **${word}** will be deleted`)
              .setFooter({ text: `Automod Rule Created` });

            await interaction.editReply({
              content: "",
              embeds: [embed2],
            });
          }, 3000);

          break;
        }

        case "spam-messages": {
          await interaction.reply({ content: `Loading your Automod rule...` });

          const rule3 = await guild.autoModerationRules.create({
            name: `Prevent spam messages by ${client.user.username}`,
            creatorId: "1139143053387509840",
            enabled: true,
            eventType: 1,
            triggerType: 3,
            triggerMetadata: {},
            actions: [
              {
                type: 1,
                metadata: {
                  channel: interaction.channel,
                  durationSeconds: 10,
                  customMessage: `This message was prevented by ${client.user.username}`,
                },
              },
            ],
          }).catch(async (err) => {
            setTimeout(async () => {
              return;
            }, 2000);
          });

          setTimeout(async () => {
            if (!rule3) return;

            const embed3 = new EmbedBuilder()
              .setColor("#2f3136")
              .setDescription(`Your automod rule has been created`)
              .setFooter({ text: `Automod Rule Created` });

            await interaction.editReply({
              content: "",
              embeds: [embed3],
            });
          }, 3000);

          break;
        }

        case "mention-spam": {
          await interaction.reply({ content: `Loading your Automod rule...` });
          const number = options.getInteger("number");

          const rule4 = await guild.autoModerationRules.create({
            name: `Prevent mention spam by ${client.user.username}`,
            creatorId: "1139143053387509840",
            enabled: true,
            eventType: 1,
            triggerType: 5,
            triggerMetadata: {
              mentionTotalLimit: number,
            },
            actions: [
              {
                type: 1,
                metadata: {
                  channel: interaction.channel,
                  durationSeconds: 10,
                  customMessage: `This message was prevented by ${client.user.username}`,
                },
              },
            ],
          }).catch(async (err) => {
            setTimeout(async () => {
              return;
            }, 2000);
          });

          setTimeout(async () => {
            if (!rule4) return;

            const embed4 = new EmbedBuilder()
              .setColor("#2f3136")
              .setDescription(`Your automod rule has been created`)
              .setFooter({ text: `Automod Rule Created` });

            await interaction.editReply({
              content: "",
              embeds: [embed4],
            });
          }, 3000);

          break;
        }
      }
    } catch (err) {
      console.log(err.message);
    }
  },
};
