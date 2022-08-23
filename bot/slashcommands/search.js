

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
            options: [
                {
                    "name": "query",
                    "description": "Recherche à effectuer",
                    "type": Discord.ApplicationCommandOptionType.String,
                    "required": true
                }
            ]
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

        await interaction.deferReply({ ephemeral: true })

        let query = interaction.options.get("query").value


        let all_discords = Modules.server.getCachedDiscords()

        let lines = [
            `${serverCount} serveurs référencé `,
            `Survolez les (?) pour afficher des infos`,
            ``,
            `_💡 Recherche plus affinées et personnalisables sur [le site](${config.website.url})_`,
        ].join("\n")

        let thisChanUrl = `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`

        function getGuild_textBloc(guildObject) {
            let lines = [
                `> ${guildObject.inviteURL ? `**[${guildObject.guild.name}](${guildObject.inviteURL} "${guildObject.inviteURL}")**` : `${guildObject.guild.name}[(?)](${thisChanUrl} "Invitation invalide")`}`
            ]


            return lines
        }

        let serverCount = all_discords.length
        await interaction.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor("#4444FF")
                    .setDescription(`${lines}`)
                    .setFooter({ text: "Référencement officiel des Discords DirtyBiologistanais."})
                    .setTimestamp()
            ]
        })
        return;


    }
}
