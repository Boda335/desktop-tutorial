
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, time } = require("discord.js");
const embed = new EmbedBuilder();

function DistubeEmbedMessage(interactions, object) {
	object?.title && embed.setTitle(object?.title);
	object?.desc && embed.setDescription(object?.desc);
	object?.time && embed.setTimestamp(object?.time);
	object?.Image && embed.setImage(object?.Image);
	object?.author && embed.setAuthor(object?.author);
	object?.thum && embed.setThumbnail(object?.thum);
	object?.url && embed.setURL(object?.url);
	embed.setColor("White");

	interactions.textChannel.send({ embeds: [embed] });
}

// قم بإضافة DistubeEmbedMessage إلى module.exports
module.exports = {
	DistubeEmbedMessage,
	getRandomString: function (length) {
		const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
		}
		return result;
	},


	shuffleString: function (string) {
		const str = string.split('');
		const length = str.length;
		for (let i = length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const tmp = str[i];
			str[i] = str[j];
			str[j] = tmp;
		}
		return str.join('');
	},
	convertTime: function (time) {
		const absoluteSeconds = Math.floor((time / 1000) % 60);
		const absoluteMinutes = Math.floor((time / (1000 * 60)) % 60);
		const absoluteHours = Math.floor((time / (1000 * 60 * 60)) % 24);
		const absoluteDays = Math.floor(time / (1000 * 60 * 60 * 24));
		const d = absoluteDays
			? absoluteDays === 1
				? '1 day'
				: `${absoluteDays} days`
			: null;
		const h = absoluteHours
			? absoluteHours === 1
				? '1 hour'
				: `${absoluteHours} hours`
			: null;
		const m = absoluteMinutes
			? absoluteMinutes === 1
				? '1 minute'
				: `${absoluteMinutes} minutes`
			: null;
		const s = absoluteSeconds
			? absoluteSeconds === 1
				? '1 second'
				: `${absoluteSeconds} seconds`
			: null;
		const absoluteTime = [];
		if (d) absoluteTime.push(d);
		if (h) absoluteTime.push(h);
		if (m) absoluteTime.push(m);
		if (s) absoluteTime.push(s);
		return absoluteTime.join(', ');
	},
	shuffleArray: function (array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	},
	randomHexColor: function () {
		return (
			'#' +
			('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6)
		);
	},

};
