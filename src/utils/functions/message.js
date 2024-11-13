const { join } = require('path');
const config = require('../../../config.json');
const reaction = config.emoji.reaction
module.exports = {
  giveaway:
    (config.everyoneMention ? "@everyone\n\n" : "") +
    `${reaction} **GIVEAWAY STARTED** ${reaction}`,
  giveawayEnded:
    (config.everyoneMention ? "@everyone\n\n" : "") +
    `${reaction} **GIVEAWAY ENDED** ${reaction}`,
  drawing:  `**Ends: {timestamp}**`,
  winnerCount:"this.winnerCount",
  inviteToParticipate: `**React with ${reaction} to participate!**`,
  winMessage: `${config.emoji.reaction}**Congratulations** {winners}\n ${config.emoji.arrow} You won **{this.prize}**\n ${config.emoji.arrow} **Hosted by: {this.hostedBy}**`,
  embedFooter: '{this.winnerCount} winner(s)',
  noWinner: `**${config.emoji.worng} Giveaway cancelled, no valid participations**${config.emoji.reaction}`,
  hostedBy: `${config.emoji.dot}**Hosted by: {this.hostedBy}**`,
  winners: `${config.emoji.dot}**Winner"s"**`,
  endedAt: "Ended at"
}