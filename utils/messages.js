const moment = require('moment');

function formatMessage(username, textmessage) {
     return{
          username,
          textmessage,
          time: moment().format('h:mm a')
     }
}

module.exports = formatMessage;