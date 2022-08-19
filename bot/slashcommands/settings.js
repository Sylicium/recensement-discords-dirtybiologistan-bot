

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

let commandInformations = {
    commandDatas: {
        name: "settings",
        description: "Gérer les paramètres de référencement",
        dmPermission: false,
        type: Discord.ApplicationCommandType.ChatInput,
        options: []
    },
    canBeDisabled: false,
    permisionsNeeded: {
        bot: ["SEND_MESSAGES","VIEW_CHANNEL"],
        user: ["ADMINISTRATOR", "MANAGE_GUILD"]
    },
    rolesNeeded: [],
    superAdminOnly: false,
    disabled: false,
    indev: true,
    hideOnHelp: false
}
module.exports.commandInformations = commandInformations
    
module.exports.execute = async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {

    await interaction.deferReply()

    let link = "https://google.com"

    await interaction.editReply({
        embeds: [
            new Discord.EmbedBuilder()
                .setColor("00FF000")
                .setDescription(`[Cliquez ici pour aller sur les paramètres](${link})`)
        ]
    })
}
