

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "help",
            description: "Afficher l'aide des commandes.",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: [
                {
                    "name": "usable",
                    "description": "Afficher uniquement les commandes que je peux utiliser",
                    "type": 5,
                    "required": false
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
        indev: false,
        hideOnHelp: false
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {


        await interaction.deferReply({ ephemeral: true })

        let commands = bot.commands.slashCommands.map((item, index) => {
            if(!item.commandInformations.hideOnHelp) {
                return { name: item.commandInformations.commandDatas.name, description: item.commandInformations.commandDatas.description, commandInformations: item.commandInformations }
            }
        })

        if(interaction.options.get("usable") && interaction.options.get("usable").value == true) {
            commands = commands.filter((item) => {
                if(!Modules.somef.isSuperAdmin(interaction.user.id) && (
                        item.commandInformations.superAdminOnly
                        || item.commandInformations.indev
                        || item.commandInformations.disabled
                    )
                ) { return false } else {
                    let permission = Modules.botf.checkPermissions(item.commandInformations.permisionsNeeded.user, interaction.member)
                    if(permission.havePerm) {
                        return true
                    } else { return false }
                }
            })
        }

        /*let commands = [
            { name: "help", description: "Afiicher cette page d'aide" },
            { name: "ping", description: "pong" },
            { name: "list", description: "Consulter la liste des Discords référencés sur le site" },
            { name: "referenceguild", description: "Référencer le Discord" },
            { name: "unreferenceguild", description: "Déréférencer le Discord" },
            { name: "setprivate", description: "Mettre ou retirer le mode privé." },
            { name: "setdescription", description: "Changer la description du serveur"},
            { name: "checkperms", description: "Affiche la liste des permissions que le bot possède." },
            { name: "info", description: ":x:ℹ Afficher des informations sur le bot et le site" },
            { name: "search", description: ":x: Rechercher un discord parmis la liste. (Pas encore disponible)" },
            { name: "certify", description: "⛔ [développeur] Permet de certifier une guilde" },
            { name: "forcerefresh", description: "⛔ [développeur] Permet de forcer la rafaîchissement des discords sur le site" }
        ]*/
        let command_string_list = []        
        for (let i in commands) {
            command_string_list.push(`\`${commands[i].name}\` : *${commands[i].description}*`)
        }

        let command_string = command_string_list.join("\n")

        await interaction.editReply({
            embeds:[
                new Discord.EmbedBuilder()
                    .setTitle("Page d'aide")
                    .setColor("FFFFFD")
                    .setDescription(command_string)
                    .setFooter({ text: "Référencement officiel des Discords DirtyBiologistanais."})
                    .setTimestamp()
            ],
            ephemeral: true
        })



    }
}
