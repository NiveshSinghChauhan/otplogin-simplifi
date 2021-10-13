const { log } = require('../../logger');

function setApiKey(key) {
    log.info(`sendGrid api key set`)
}


function send(data, isMultiple = false, cb = (err, result) => { }) {
    log.info(`email sent to ${data.to}, message ${data.text}`)
    return Promise.resolve();
}


module.exports = {
    send,
    setApiKey
}
