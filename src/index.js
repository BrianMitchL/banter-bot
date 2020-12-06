const { generateRandomTime, waitUntilTime } = require('./timeUtils')

function waitAndRecurse(incrementDay = false) {
    const time = generateRandomTime({ hour: 8, minute: 0 }, { hour: 23, minute: 0 }, incrementDay)
    waitUntilTime(time).then(() => {
        console.log("time is now")
        waitAndRecurse(true)
    })
}

(() => {
    require("dotenv").config();
    const Discord = require("discord.js");
    const client = new Discord.Client();
    client.login(process.env.TOKEN)
    client.once('ready', () => {
        client.on('voiceStateUpdate', async (before, after) => {
            if (before.member.id === client.user.id) return;
            console.log({ before: before.channelID, after: after.channelID })
            if (before.channelID === null && after.channelID) {
                console.log("trying to join")
                // Play startup noise :)
                const connection = await after.channel.join();
                console.log("joined")
                const dispatch = connection.play("new-connection.mp3");
                dispatch.on("start", () => console.log('starting'))
                dispatch.on('finish', () => connection.disconnect())
                dispatch.on('error', (e) => { connection.disconnect(); console.log(e) })
            }
        })

        client.on('messageReactionAdd', (react, user) => {
            if (react.message.author.id !== client.user.id) return;
            // react.message.channel.send(`I saw what you did <@${user.id}> ${react.emoji}`);
        })

        client.on('message', async msg => {
            if (msg.author.bot) return
            if (!msg.mentions.has({ id: client.user.id })) return
            console.log(msg.content)
            if (msg.content.toLowerCase().includes("provoke our thoughts")) {
                const randomQuestion = await require("./questions").getRandomQuestion(msg);
                return msg.channel.send(randomQuestion)
            } if (msg.content.toLowerCase().includes("poll us")) {
                return await require("./questions").createRandomPoll(msg)
            }
            msg.reply("Please just let me exist in peace.")
        })
    })

    waitAndRecurse()
})()

