'use strict';

const BOT_NAME = 'bbbot';
const PLACE_KEY = 'place';

const dotenv = require('dotenv').config();
const moment = require('moment');
const redis = require('redis');
const Bot = require('slackbots');
const sprintf = require('sprintf-js').sprintf;

const redisClient = redis.createClient();

const places = require('./places').filter(place => place.deleted !== true);

redisClient.on('connect', err => {
  // Set places in Redis.
  places.forEach(place => {
    redisClient.get(`${PLACE_KEY}:${place.id}.count`, (err, res) => {
      // Initialize.
      if (res === null) {
        redisClient.set(
          `${PLACE_KEY}:${place.id}.name`,
          place.name,
          redis.print
        );
        redisClient.set(`${PLACE_KEY}:${place.id}.count`, 0, redis.print);
      } else {
        place.count = parseInt(res, 10);
      }
    });
  });
});

const bot = new Bot({ token: process.env.BOT_API_KEY, name: BOT_NAME });

let botUser = {};
let lastUser = { at: moment() };
let members = [];
let channels = [];
const rejectMessages = ['%s! 그만 찾아', '작작하자 %s...', '안알랴줌', '나도 밥 줘'];

const _isChatMessage = message => {
  return message.type === 'message' && Boolean(message.text);
};
const _isChannelConversation = message => {
  return typeof message.channel === 'string' && message.channel[0] === 'C';
};
const _isFromBBBot = message => {
  return message.user === botUser.id;
};
const _isMentioningMeal = message => {
  return message.text.toLowerCase().indexOf('식샤') > -1;
};
const _isMentioningStats = message => {
  return message.text.toLowerCase().indexOf('!통계') > -1;
};

bot.on('start', function() {
  bot.getUser(BOT_NAME).then(user => {
    botUser = user;
  });
  bot.getChannels().then(data => {
    channels = data.channels.filter(channel => channel.is_archived === false);
  });
  bot.getUsers().then(data => {
    members = data.members.filter(member => member.deleted === false);
  });
});

bot.on('message', message => {
  if (
    _isChatMessage(message) &&
    _isChannelConversation(message) &&
    !_isFromBBBot(message)
  ) {
    const channel = channels.filter(
      channel => channel.id === message.channel
    )[0];

    if (_isMentioningMeal(message)) {
      if (
        message.user === lastUser.id &&
        moment().isBefore(lastUser.at.add(10, 'minutes'))
      ) {
        bot.postMessageToChannel(
          channel.name,
          sprintf(
            rejectMessages[Math.floor(Math.random() * rejectMessages.length)],
            members.filter(member => member.id === message.user)[0].profile
              .real_name_normalized
          ),
          { as_user: true }
        );
      } else {
        lastUser = { id: message.user, at: moment() };
        const place = places[Math.floor(Math.random() * places.length)];
        redisClient.get(`${PLACE_KEY}:${place.id}.count`, (err, res) => {
          const count = parseInt(res, 10) + 1;

          redisClient.set(`${PLACE_KEY}:${place.id}.count`, count);
          place.count = count;

          bot.postMessageToChannel(channel.name, `멍! ${place.name}! 멍!`, {
            as_user: true
          });
        });
      }
    } else if (_isMentioningStats(message)) {
      let body = '';
      places
        .sort((a, b) => {
          return b.count - a.count;
        })
        .forEach(place => {
          body += `${place.name} (${place.count})\n`;
        });

      bot.postMessageToChannel(channel.name, body, { as_user: true });
    }
  }
});
