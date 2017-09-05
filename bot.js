'use strict';

const dotenv = require('dotenv').config();
const moment = require('moment');
const Bot = require('slackbots');

const bot = new Bot({ token: process.env.BOT_API_KEY, name: 'bbbot' });

const botUser = {};
let lastUser = { at: moment() };
let members = [];
let channels = [];
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
  '하동관',
  '호천탕 돈까스'
];
const rejectMessages = ['그만 찾아', '작작하자', '안알랴줌', '나도 밥 줘'];

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
  bot.getUsers().then(data => {
    members = data.members;
  });
});

bot.on('message', function(message) {
  if (
    _isChatMessage(message) &&
    _isChannelConversation(message) &&
    !_isFromBBBot(message) &&
    _isMentioningMeal(message)
  ) {
    const channel = channels.filter(
      channel => channel.id == message.channel
    )[0];
    if (
      message.user === lastUser.id &&
      moment().isBefore(lastUser.at.add(10, 'minutes'))
    ) {
      bot.postMessageToChannel(
        channel.name,
        rejectMessages[Math.floor(Math.random() * rejectMessages.length)],
        { as_user: true }
      );
    } else {
      lastUser = { id: message.user, at: moment() };
      const place = places[Math.floor(Math.random() * places.length)];
      bot.postMessageToChannel(channel.name, `멍! ${place}! 멍!`, {
        as_user: true
      });
    }
  }
});
