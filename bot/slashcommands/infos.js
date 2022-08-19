

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "infos",
            description: "ℹ Afficher des informations sur le bot, le discord et le site.",
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
        indev: false,
        hideOnHelp: false
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {

        await interaction.deferReply()

        let guildInfos = await Modules.Database.isReferencedGuild(interaction.guild.id)

        let ico = {
            on: config.emojis.bluebutton.tag,
            off: config.emojis.whitebutton.tag,
            bar_l: config.emojis.whitebarleft.tag,
            bar: config.emojis.whitebar.tag,
            bar_r: config.emojis.whitebarright.tag,
        }

        let lines = [
            `${ico.bar_l}${ico.bar}${ico.bar}${ico.bar} **Bot** ${ico.bar}${ico.bar}${ico.bar}${ico.bar_r}`,
            `${ico.off} Maintenance`,
            ``,
            `${ico.bar_l}${ico.bar}${ico.bar}${ico.bar} **Serveur** ${ico.bar}${ico.bar}${ico.bar}${ico.bar_r}`,
            `${guildInfos.settings.private ? ico.on : ico.off} Mode privé`,
            `${guildInfos.settings.certified ? ico.on : ico.off} Certifié`,
            `${guildInfos.settings.isBotOnGuild ? ico.on : ico.off} Le bot est toujours présent sur le serveur`,
            `Description: \`\`\`${guildInfos.guild.description}\`\`\` `,
            `Mots clé: \`\`\`${guildInfos.keywords ? guildInfos.keywords.join(", ") : "Aucun mot clé"}\`\`\` `,
            ``,
            `${ico.bar_l}${ico.bar}${ico.bar}${ico.bar} **Autre** ${ico.bar}${ico.bar}${ico.bar}${ico.bar_r}`,
            `Aucun paramètre.`
        ].join("\n")

        await interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("Informations générales")
                    .setColor("FFFFFF")
                    .setDescription(lines)
                    .setFooter({ text: `Recensement des discord DirtyBiologistanais • Centre de renseignements` })
            ]
        })
        return;


    }
}
