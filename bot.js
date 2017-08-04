'use strict';

const dotenv = require('dotenv').config();
const Bot = require('slackbots');

const bot = new Bot({
  token: process.env.BOT_API_KEY,
  name: 'bbbot'
});

const botUser = {};
const channels = [];
const places = [
  '고운님 요일 백반',
  '동인동 칼국수',
  '맥도날드',
  '반룡산',
  '버거킹',
  '서브웨이',
  '석기정 부대찌개',
  '선릉 우리집만두',
  '소백 주꾸미 볶음',
  '스모키살룬',
  '슬로우시티 집밥',
  '알로이타이',
  '에머이 쌀국수',
  '의령전원 생선구이',
  '이화수 육개장',
  '진고래 복국',
  '탄 라멘',
  '토마토 라멘',
  '평가옥',
  '포스코 지하 김밥',
  '포스코 지하 백반',
  '하동관',
  '호천탕 돈까스'
];

const _isChatMessage = function(message) {
  return message.type === 'message' && Boolean(message.text);
};
const _isChannelConversation = function(message) {
  return typeof message.channel === 'string' && message.channel[0] === 'C';
};
const _isFromBBBot = function(message) {
  return message.user === botUser.id;
};
const _isMentioningMeal = function(message) {
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
  if (
    _isChatMessage(message) &&
    _isChannelConversation(message) &&
    !_isFromBBBot(message) &&
    _isMentioningMeal(message)
  ) {
    const channel = (function(channelId) {
      return channels.filter(function(item) {
        return item.id === channelId;
      })[0];
    })(message.channel);
    const place = places[Math.floor(Math.random() * places.length)];
    bot.postMessageToChannel(channel.name, `멍! ${place}! 멍!`, {
      as_user: true
    });
  }
});
