const sendSticker = require('./sendSticker')


exports.sendSticker = async function (message) {
  for (let i = 0; i < queueSticker.length; i++) {
    if (queueSticker[i].from == message.from) {
      console.log(queueSticker[i].from)
      sendSticker.sendSticker(queueSticker[i])
      queueSticker.splice(i, 1)
    }
  }
}
exports.sendAnimatedSticker = async function (message) {
  for (let i = 0; i < queueAnimatedSticker.length; i++) {
    if (queueAnimatedSticker[i].from == message.from) {
      console.log(queueAnimatedSticker[i].from)
      sendSticker.sendAnimatedSticker(queueAnimatedSticker[i])
      queueAnimatedSticker.splice(i, 1)
    }
  }
}
