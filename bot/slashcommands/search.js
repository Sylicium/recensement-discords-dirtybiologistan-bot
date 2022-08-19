

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "search",
            description: "Rechercher des discords",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: []
        },
        canBeDisabled: false,
        permisionsNeeded: {
            bot: ["SEND_MESSAGES","VIEW_CHANNEL"],
            user: []
        },
        rolesNeeded: [],
        superAdminOnly: false,
        disabled: false,
        indev: true,
        hideOnHelp: false
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {

        interaction.deferReply({ ephemeral: true })

        let serverCount = server.getCachedDiscords().length
        interaction.reply("a",
            new EmbedBuilder()
                .setColor("#4444FF")
                .setDescription(`${serverCount} serveurs référencé, [consulter la liste des serveurs de la micronation 🌎](${config.website.url})`)
                .setFooter({ text: "Référencement officiel des Discords DirtyBiologistanais."})
                .setTimestamp()
        )
        return;


    }
}
