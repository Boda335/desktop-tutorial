const { ActionRowBuilder, UserSelectMenuBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "invite",
  enabled: true,

  async action(client, interaction, parts) {
    const filePath = path.join(__dirname, "..", "..", "events", "temp-voice", "userVoiceData.json");
    let data = {};
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath);
      data = JSON.parse(fileContent);
    }

    const userVoiceData = data[interaction.user.id];
    if (!userVoiceData || !userVoiceData.voiceChannelId) {
      return interaction.reply({
        embeds: [nov],
        ephemeral: true
      });
    }

    const selectMenu = new UserSelectMenuBuilder()
      .setCustomId("selectUserToInvite")
      .setPlaceholder('Select user will be invited to join');

    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    // الرد الأول مع السيلكت ويكون إيفرمنال
    await interaction.reply({
      components: [actionRow],
      ephemeral: true
    });

    // يمكننا إلغاء الكوليكتور السابق لكي لا يتم استخدامه مع كل تفاعل جديد
    const filter = (i) => i.customId === "selectUserToInvite" && i.user.id === interaction.user.id;
    
    // تفعيل الكوليكتور بدون التفاعل السابق
    const collected = await interaction.channel.awaitMessageComponent({
      filter,
      time: 60000,
    }).catch(() => null);

    if (collected) {
      const selectedUserId = collected.values[0];
      const selectedUser = await client.users.fetch(selectedUserId);

      const cant = new EmbedBuilder()
      .setColor('White')
      .setDescription('# Not Possible! \nYou cannot use this command for the selected user(s).')
      .setImage('https://e.top4top.io/p_3236d5htv1.png')
      .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
      if (selectedUser.id === interaction.user.id || selectedUser.bot) {
        await collected.update({
          embeds:[cant],
          components: [], // إخفاء السيلكت بعد إرسال الرسالة
        });
        return;
      }

      const inviteLink = await interaction.guild.channels
        .fetch(userVoiceData.voiceChannelId)
        .then(channel => channel.createInvite({ unique: true }))
        .catch(() => null);

      const invite = new EmbedBuilder()
      .setColor('White')
      .setDescription(`# New Invitation! \n<@${interaction.user.id}> has invited you to join <#${userVoiceData.voiceChannelId}>`)
      .setImage('https://e.top4top.io/p_3236d5htv1.png')
      .setFooter({text:`${interaction.guild.name}`})
      
      if (inviteLink) {
        await selectedUser.send({
          content: `-# <@${interaction.user.id}> - ${selectedUser}`,
          embeds:[invite],
        });
        
        const dn = new EmbedBuilder()
        .setColor('White')
        .setDescription('# Invited!\n An invitation to join your temporary voice channel was sent to the user.')
        .setImage('https://e.top4top.io/p_3236d5htv1.png')
        .setFooter({ text: 'Powerd By Nexus System', iconURL: client.user.displayAvatarURL() });
        
        await collected.update({
          embeds:[dn],
          components: [], // إخفاء السيلكت بعد إرسال الدعوة
        });
      } else {
        await collected.update({
          embeds:[cant],
          components: [],
        });
      }
      
    } else {
      await interaction.followUp({
        content: "No member has been selected or timed out.",
        ephemeral: true,
      });
    }
  },
};
