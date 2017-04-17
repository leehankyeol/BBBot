'use strict';

var dotenv = require('dotenv').config();
var Bot = require('slackbots');

var bot = new Bot({
  token: process.env.BOT_API_KEY,
  name: 'bbbot',
});

var botUser = {};
var channels = [];
var places = [
];

const _isChatMessage = function(message) {
  return message.type === 'message' && Boolean(message.text);
}
const _isChannelConversation = function(message) {
  return typeof message.channel === 'string' &&
    message.channel[0] === 'C';
}
const _isFromBBBot = function (message) {
  return message.user === botUser.id;
};
const _isMentioningMeal = function (message) {
  return message.text.toLowerCase().indexOf('식샤') > -1;
};

bot.on('start', function() {
  bot.getUser('bbbot').then(function(user) {
    botUser = user;
  });
  bot.getChannels().then(function(data) {
    channels = data.channels;
  });
});

bot.on('message', function(message) {
  if (_isChatMessage(message) &&
    // _isChannelConversation(message) &&
    !_isFromBBBot(message) &&
    _isMentioningMeal(message)
  ) {
    var channel = function(channelId) {
      return channels.filter(function (item) {
        return item.id === channelId;
      })[0];
    }(message.channel);
    var place = places[Math.floor(Math.random() * places.length)];
    bot.postMessageToChannel(channel.name, message, {as_user: true});
  }
});
