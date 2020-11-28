const { decryptMedia } = require('@open-wa/wa-decrypt')
const fs = require('fs-extra')
const axios = require('axios')
const moment = require('moment-timezone')
const sendSticker = require('./sendSticker')
const get = require('got')
const { RemoveBgResult, removeBackgroundFromImageBase64, removeBackgroundFromImageFile } = require('remove.bg')
const color = require('./lib/color')
const { wallpaperanime, liriklagu, quotemaker, wall } = require('./lib/functions')
const { help, info, } = require('./lib/help')
const msgFilter = require('./lib/msgFilter')
const akaneko = require('akaneko');
const { exec } = require('child_process')
const fetch = require('node-fetch');
const ruleArr = JSON.parse(fs.readFileSync('./lib/rule.json'))
const bent = require('bent')
const wel = JSON.parse(fs.readFileSync('./lib/welcome.json'))
const nsfwgrp = JSON.parse(fs.readFileSync('./lib/nsfw.json'))
const ban = JSON.parse(fs.readFileSync('./lib/banned.json'))
const errorurl = 'https://steamuserimages-a.akamaihd.net/ugc/954087817129084207/5B7E46EE484181A676C02DFCAD48ECB1C74BC423/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false'
const errorurl2 = 'https://steamuserimages-a.akamaihd.net/ugc/954087817129084207/5B7E46EE484181A676C02DFCAD48ECB1C74BC423/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = msgHandler = async (client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, chatId, caption, isMedia, mimetype, quotedMsg, mentionedJidList, author, quotedMsgObj } = message
        let { body } = message
        const { name } = chat
        let { pushname, verifiedName } = sender
        const prefix = '#'
        body = (type === 'chat' && body.startsWith(prefix)) ? body : ((type === 'image' && caption || type === 'video' && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase()
        const args = body.slice(prefix.length).trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const isRule = ruleArr.includes(chat.id)
        const time = moment(t * 1000).format('DD/MM HH:mm:ss')

        if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) return console.log(color('[SPAM!]', 'red'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
        if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) return console.log(color('[SPAM!]', 'red'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name))
        if (!isCmd && !isGroupMsg) return console.log('[RECV]', color(time, 'yellow'), 'Message from', color(pushname))
        if (!isCmd && isGroupMsg) return console.log('[RECV]', color(time, 'yellow'), 'Message from', color(pushname), 'in', color(name))
        if (isGroupMsg && isRule && (type === 'chat' && message.body.includes('chat.whatsapp.com') && isBotGroupAdmins) && !isGroupAdmins) return await client.removeParticipant(chat.id, author)
        if (isCmd && !isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
        if (isCmd && isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name))
        const botNumber = await client.getHostNumber()
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false
        const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber + '@c.us') : false
        const isBanned = ban.includes(sender.id)
        const owner = '918280543574' // eg 9190xxxxxxxx
        const isowner = owner + '@c.us' == sender.id

        msgFilter.addFilter(from)

        const uaOverride = 'WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
        const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi)
        if (!isBanned) {
            switch (command) {
                case 'sticker':
                case 'stiker':
                    if (isMedia && type == 'video') {
                        if (message.duration < 15) {
                            sendSticker.sendAnimatedSticker(message)
                        } else {
                            await client.reply(from, 'The given file is too large for converting', id)
                        }
                    } else if (isMedia && type == 'image') {
                        const mediaData = await decryptMedia(message)
                        const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                        const baseImg = imageBase64.replace('video/mp4', 'image/gif')
                        await client.sendImageAsSticker(from, baseImg)
                    } else if (quotedMsg && quotedMsg.type == 'image') {
                        const mediaData = await decryptMedia(quotedMsg)
                        const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                        await client.sendImageAsSticker(from, imageBase64)
                    } else if (quotedMsg && quotedMsg.type == 'video') {
                        if (quotedMsg.duration < 15) {
                            sendSticker.sendAnimatedSticker(quotedMsgObj)
                        } else {
                            await client.reply(from, 'The given file is too large for converting', id)
                        }
                    } else {
                        client.reply(from, 'You did not tag a picture or video, Baka', message.id)
                    }
                    break


                case 'gifsticker':
                    if (isMedia && type == 'video') {
                        if (mimetype === 'video/mp4' && message.duration < 30) {
                            const mediaData = await decryptMedia(message, uaOverride)
                            const filename = `./media/aswu.mp4`
                            await fs.writeFile(filename, mediaData)
                            await exec('ffmpeg -i ./media/aswu.mp4 -vf scale=512:-1 -r 10 -f image2pipe -framerate 24 -vcodec ppm - | convert -delay 0 -loop 0 - ./media/output.gif')
                            const contents = await fs.readFile('./media/output.gif', { encoding: 'base64' })
                            await client.sendImageAsSticker(from, `data:image/gif;base64,${contents.toString('base64')}`)
                        }
                    }
                    break

                case 'quotemaker':
                    arg = body.trim().split('|')
                    if (arg.length >= 3) {
                        client.reply(from, 'Processing...', message.id)
                        const quotes = arg[1]
                        const author = arg[2]
                        const theme = arg[3]
                        try {
                            const resolt = await quotemaker(quotes, author, theme)
                            client.sendFile(from, resolt, 'quotesmaker.jpg', 'neh...')
                        } catch {
                            client.reply(from, 'I\'m afraid to tell you that the image failed to process', message.id)
                        }
                    } else {
                        client.reply(from, 'Usage: \n!quotemaker |text|watermark|theme\n\nEx :\n!quotemaker |...|...|random', message.id)
                    }
                    break

                case 'groupinfo':
                    if (!isGroupMsg) return client.reply(from, '.', message.id)
                    var totalMem = chat.groupMetadata.participants.length
                    var desc = chat.groupMetadata.desc
                    var groupname = name
                    var welgrp = wel.includes(chat.id)
                    var ngrp = nsfwgrp.includes(chat.id)
                    var grouppic = await client.getProfilePicFromServer(chat.id)
                    var pkgame = pokarr.includes(chat.id)
                    if (grouppic == undefined) {
                        var pfp = errorurl
                    } else {
                        var pfp = grouppic
                    }
                    await client.sendFileFromUrl(from, pfp, 'group.png', `*${groupname}* 

🌐️ *Members: ${totalMem}*

💌️ *Welcome: ${welgrp}*

🎉️ *PokeGame* : *${pkgame}*

🔮️ *Rule* : *${isRule}*

⚜️ *NSFW: ${ngrp}*

📃️ *Group Description* 

${desc}`)
                    break
                case 'test':
                    if (!isowner) return client.reply(from, 'Only Bot admins!', message.id)
                    let msg = body.slice(4)
                    const chatz = await client.getAllChatIds()
                    for (let ids of chatz) {
                        var cvk = await client.getChatById(ids)
                        if (!cvk.isReadOnly) client.sendText(ids, `[ EWH BOT Broadcast ]\n\n${msg}`)
                    }
                    client.reply(from, 'Broadcast Success!', message.id)
                    break
                case 'ban':
                    if (!isowner) return client.reply(from, 'Only Bot admins can use this CMD!', message.id)
                    for (let i = 0; i < mentionedJidList.length; i++) {
                        ban.push(mentionedJidList[i])
                        fs.writeFileSync('./lib/banned.json', JSON.stringify(ban))
                        client.reply(from, 'Succes ban target!', message.id)
                    }
                    break


                case 'ping':
                    if (!isGroupMsg) return client.reply(from, 'Sorry, This command can only be used in groups', message.id)
                    if (!isGroupAdmins) return client.reply(from, 'Well, only admins can use this command', message.id)
                    const groupMem = await client.getGroupMembers(groupId)
                    let hehe = `${body.slice(6)} - ${pushname} \n`
                    for (let i = 0; i < groupMem.length; i++) {
                        hehe += '✨️'
                        hehe += ` @${groupMem[i].id.replace(/@c.us/g, '')}\n`
                    }
                    hehe += '----------------------'
                    await client.sendTextWithMentions(from, hehe)
                    break

                case 'kickall':
                    const isGroupOwner = sender.id === chat.groupMetadata.owner
                    if (!isGroupOwner) return client.reply(from, 'Sorry, Only group owner can use this CMD', message.id)
                    if (!isGroupMsg) return client.reply(from, 'This command can only be used in groups', message.id)
                    if (!isBotGroupAdmins) return client.reply(from, 'You need to give me the power to do this before executing', message.id)
                    const allMem = await client.getGroupMembers(groupId)
                    console.log(isGroupAdmins)
                    for (let i = 0; i < allMem.length; i++) {
                        if (groupAdmins.includes(allMem[i].id)) return
                        await client.removeParticipant(groupId, allMem[i].id)
                    }
                    client.reply(from, 'Done!', message.id)
                    break

                case 'clearall':
                    if (!isowner) return client.reply(from, 'Owner only', message.id)
                    const allChatz = await client.getAllChats()
                    for (let dchat of allChatz) {
                        await client.deleteChat(dchat.id)
                    }
                    client.reply(from, 'Done', message.id)
                    break

                case 'act':
                    arg = body.trim().split(' ')
                    if (!isGroupAdmins) return client.reply(from, 'Only Admins can use this command, Baka >.<', id)
                    if (arg[1].toLowerCase() == 'welcome') {
                        if (wel.includes(chat.id)) {
                            client.reply(from, `Welcome is already registered on *${name}*`, message.id)
                        } else {
                            wel.push(chat.id)
                            fs.writeFileSync('./lib/welcome.json', JSON.stringify(wel))
                            client.reply(from, `Welcome is now registered on *${name}*`, message.id)
                        }
                    } else if (arg[1].toLowerCase() == 'nsfw') {
                        if (nsfwgrp.includes(chat.id)) {
                            client.reply(from, `NSFW is already registered on *${name}*`, message.id)
                        } else {
                            nsfwgrp.push(chat.id)
                            fs.writeFileSync('./lib/nsfw.json', JSON.stringify(nsfwgrp))
                            client.reply(from, `NSFW is now registered on *${name}*`, message.id)
                        }
                    } else if (arg[1].toLowerCase() == 'rule') {
                        if (!isBotGroupAdmins) return client.reply(from, 'You need to make me admin to use this CMD', message.id)
                        if (ruleArr.includes(chat.id)) {
                            client.reply(from, `Rule is already registered on *${name}*`, message.id)
                        } else {
                            ruleArr.push(chat.id)
                            fs.writeFileSync('./lib/rule.json', JSON.stringify(ruleArr))
                            client.reply(from, `Rule is now registered on *${name}*`, message.id)
                        }
                    }
                    break
                case 'deact':
                    arg = body.trim().split(' ')
                    if (!isGroupAdmins) return client.reply(from, 'Only Admins can use this command, Baka >.<', id)
                    if (arg[1].toLowerCase() == 'welcome') {
                        let inx = ban.indexOf(from)
                        wel.splice(inx, 1)
                        fs.writeFileSync('./lib/welcome.json', JSON.stringify(wel))
                        client.reply(from, `Welcome is now unregistered on *${name}*`, message.id)
                    } else if (arg[1].toLowerCase() == 'nsfw') {
                        let inx = ban.indexOf(from)
                        nsfwgrp.splice(inx, 1)
                        fs.writeFileSync('./lib/nsfw.json', JSON.stringify(nsfwgrp))
                        client.reply(from, `NSFW is now unregistered on *${name}*`, message.id)
                    } else if (arg[1].toLowerCase() == 'pokegame') {
                        let inx = pokarr.indexOf(from)
                        pokarr.splice(inx, 1)
                        fs.writeFileSync('./lib/poke.json', JSON.stringify(pokarr))
                        client.reply(from, `PokeGame is now unregistered on *${name}*`, message.id)
                    } else if (arg[1].toLowerCase() == 'rule') {
                        let inx = ruleArr.indexOf(from)
                        ruleArr.splice(inx, 1)
                        fs.writeFileSync('./lib/rule.json', JSON.stringify(ruleArr))
                        client.reply(from, `Rule is now unregistered on *${name}*`, message.id)
                    }
                    break

                case 'cgc':
                    arg = body.trim().split(' ')
                    const gcname = arg[1]
                    client.createGroup(gcname, mentionedJidList)
                    client.sendText(from, 'Group Created ✨️')
                    break

                case 'sendnudes':
                    try {
                        const response1 = await axios.get('https://meme-api.herokuapp.com/gimme/IndiansGoneWild');
                        const {
                            postLink,
                            title,
                            subreddit,
                            url,
                            nsfw,
                            spoiler
                        } = response1.data

                        const isnsfw = nsfwgrp.includes(from)
                        if (nsfw == true) {
                            if ((isGroupMsg) && (isnsfw)) {
                                await client.sendFileFromUrl(from, `${url}`, 'Reddit.jpg', `${title}` + '\n\nPostlink:' + `${postLink}`)
                            } else if ((isGroupMsg) && (!isnsfw)) {
                                await client.reply(from, `NSFW is not registered on *${name}*`, id)
                            }
                        } else {
                            await client.sendFileFromUrl(from, `${url}`, 'Reddit.jpg', `${title}` + '\n\nPostlink:' + `${postLink}`)
                        }
                    } catch (err) {
                        console.log(err)
                        await client.reply(from, 'There is no such subreddit, Baka!', id)
                    }
                    break
                case 'unban':
                    if (!isowner) return client.reply(from, 'Only bot admins can use this CMD', message.id)
                    let inx = ban.indexOf(mentionedJidList[0])
                    ban.splice(inx, 1)
                    fs.writeFileSync('./lib/banned.json', JSON.stringify(ban))
                    client.reply(from, 'Unbanned User!', message.id)
                    break
                case 'kick':
                    if (!isGroupMsg) return client.reply(from, '...', message.id)
                    if (!isGroupAdmins) return client.reply(from, 'You are not an admin, Sorry', message.id)
                    if (!isBotGroupAdmins) return client.reply(from, 'You need to make me admin to use this CMD', message.id)
                    if (mentionedJidList.length === 0) return client.reply(from, 'Wrong format', message.id)
                    await client.sendText(from, `Request Accepted! issued:\n${mentionedJidList.join('\n')}`)
                    for (let i = 0; i < mentionedJidList.length; i++) {
                        if (groupAdmins.includes(mentionedJidList[i])) return await client.reply(from, '....', message.id)
                        await client.removeParticipant(groupId, mentionedJidList[i])
                    }
                    break
                case 'delete':
                    if (!isGroupAdmins) return client.reply(from, 'Only admins can use this command', id)
                    if (!quotedMsg) return client.reply(from, 'Wrong Format!', id)
                    if (!quotedMsgObj.fromMe) return client.reply(from, 'Wrong Format!', id)
                    client.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
                    break
                case 'leave':
                    if (!isGroupMsg) return client.reply(from, '...', message.id)
                    if (!isGroupAdmins) return client.reply(from, 'You are not an admin', message.id)
                    await client.sendText(from, 'Sayonara').then(() => client.leaveGroup(groupId))
                    break
                case 'promote':
                    if (!isGroupMsg) return client.reply(from, '.', message.id)
                    if (!isGroupAdmins) return client.reply(from, 'You are not an admin', message.id)
                    if (!isBotGroupAdmins) return client.reply(from, 'You need to make me admin to use this CMD', message.id)
                    if (mentionedJidList.length === 0) return await client.reply(from, 'Wrong format!', message.id)
                    if (mentionedJidList.length >= 2) return await client.reply(from, 'One user at a time', message.id)
                    if (groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'This user is already admin', message.id)
                    await client.promoteParticipant(groupId, mentionedJidList[0])
                    await client.sendTextWithMentions(from, `@${mentionedJidList[0].replace('@c.us', '')} is now an admin`)
                    break
                case 'demote':
                    if (!isGroupAdmins) return client.reply(from, 'You are not an admin', message.id)
                    if (!isBotGroupAdmins) return client.reply(from, 'You need to make me admin to use this CMD', message.id)
                    if (mentionedJidList.length === 0) return client.reply(from, 'Wrong Format', message.id)
                    if (mentionedJidList.length >= 2) return await client.reply(from, 'One user at a time', message.id)
                    if (!groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'The user isn\'t an admin', message.id)
                    await client.demoteParticipant(groupId, mentionedJidList[0])
                    await client.sendTextWithMentions(from, `Demoted @${mentionedJidList[0].replace('@c.us', '')}.`)
                    break
                case 'join':
                    if (args.length == 0) return client.reply(from, 'Wrong Format', message.id)
                    const link = body.slice(6)
                    const minMem = 30
                    const isLink = link.match(/(https:\/\/chat.whatsapp.com)/gi)
                    const check = await client.inviteInfo(link)
                    if (!isLink) return client.reply(from, 'Where\'s the link?', message.id)
                    if (check.size < minMem) return client.reply(from, 'The group does not have 30+ members', message.id)
                    await client.joinGroupViaLink(link).then(async () => {
                        await client.reply(from, '*Joined* ✨️', message.id)
                    }).catch(error => {
                        client.reply(from, 'An error occured 💔️', message.id)
                    })
                    break

                case 'lyrics':
                    if (args.length == 0) return client.reply(from, 'Wrong Format', message.id)
                    const lagu = body.slice(7)
                    console.log(lagu)
                    const lirik = await liriklagu(lagu)
                    client.sendText(from, lirik)
                    break

                case 'roll':
                    const dice = Math.floor(Math.random() * 6) + 1
                    await client.sendStickerfromUrl(from, 'https://www.random.org/dice/dice' + dice + '.png')
                    break
                case 'flip':
                    const side = Math.floor(Math.random() * 2) + 1
                    if (side == 1) {
                        client.reply(from, '*Heads*')
                    } else {
                        client.sendStickerfromUrl(from, '*Tails*')
                    }
                    break

                case 'meme':
                    const response = await axios.get('https://meme-api.herokuapp.com/gimme/IndianDankMemes');
                    const { postlink, title, subreddit, url, nsfw, spoiler } = response.data
                    await client.sendFileFromUrl(from, `${url}`, 'meme.jpg', `${title}`)
                    break

                case 'help':
                    client.reply(from, help.replace(undefined, pushname), message.id)
                    break

                case 'info':
                    client.reply(from, info, id)
                    break

                case 'profile':
                    var role = 'None'
                    if (isGroupMsg) {
                        if (!quotedMsg) {
                            var block = ban.includes(author)
                            var pic = await client.getProfilePicFromServer(author)
                            var namae = pushname
                            var sts = await client.getStatus(author)
                            var adm = isGroupAdmins
                            const { status } = sts
                            if (pic == undefined) {
                                var pfp = errorurl
                            } else {
                                var pfp = pic
                            }
                            await client.sendFileFromUrl(from, pfp, 'pfp.jpg', `*User Profile* ✨️ \n\n 🔖️ *Username: ${namae}*\n\n💌️ *User Info: ${status}*\n\n*💔️ Ban: ${block}*\n\n✨️ *Role: ${role}*\n\n 👑️ *Admin: ${adm}*`)
                        } else if (quotedMsg) {
                            var qmid = quotedMsgObj.sender.id
                            var block = ban.includes(qmid)
                            var pic = await client.getProfilePicFromServer(qmid)
                            var namae = quotedMsgObj.sender.name
                            var sts = await client.getStatus(qmid)
                            var adm = isGroupAdmins
                            const { status } = sts
                            if (pic == undefined) {
                                var pfp = errorurl
                            } else {
                                var pfp = pic
                            }
                            await client.sendFileFromUrl(from, pfp, 'pfo.jpg', `*User Profile* ✨️ \n\n 🔖️ *Username: ${namae}*\n💌️ *User Info: ${status}*\n*💔️ Ban: ${block}*\n✨️ *Role: ${role}*\n 👑️ *Admin: ${adm}*`)
                        }
                    }
                    break

                default:
                    console.log(color('[UNLISTED]', 'red'), color(time, 'yellow'), 'Unregistered Command from', color(pushname))
                    break
            }
        }
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
    }
}
