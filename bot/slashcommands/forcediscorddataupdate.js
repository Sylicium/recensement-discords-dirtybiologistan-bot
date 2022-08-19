

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")
const server = require("../../server")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "forcediscorddataupdate",
            description: "⛔ Forcer le raffraîchissement des données de tous les discords.",
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
        superAdminOnly: true,
        disabled: false,
        indev: false,
        hideOnHelp: true
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {
        
        await interaction.deferReply({ ephemeral: true })

        interaction.editReply(`${config.emojis.loading.tag} Rafraîchissement des informations de tous les serveurs discord...`).then(async msg => {
            await Database.updateDiscordDatas_allGuilds()
            interaction.editReply(`${config.emojis.check_mark.tag} Opération terminée, les données de ${discordCached.length} discords ont été rafraîchies.`)
        }).catch(e => {
            console.log(e)
            interaction.editReply(`:x: Une erreur est survenue durant le rafraîchissement des informations: \`\`\`js\n${e}\`\`\` `)
        })
        return;


    }
}
