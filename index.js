

let config = require('./config')

let inDev = condif.inDev

try {
    require("dotenv").config()
} catch(e) {}

function writeUncaughException(e, title) {
    console.error("[DBG] Uncaught Exception or Rejection", e.stack)
    console.error(e.stack.split("\n"))
    const fs = require('fs')

    let date = (new Date).toLocaleString("fr-FR")

    if (!title) title = "/!\\ UNCAUGH ERROR /!\\"

    let log_text = `${title} ${e.stack.split("\n").join("\n")}\n`

    //console.log(`[${date} ERROR] (unknown): /!\\ UNCAUGH ERROR /!\\ ${e.stack}`)
    if (!fs.existsSync("./logs/mainUncaugh.log")) {
        fs.writeFileSync("./logs/mainUncaugh.log", `File created on ${date}\n\n`)
    }
    let log_text_split = log_text.split("\n")
    for (let i in log_text_split) {
        fs.appendFileSync("./logs/mainUncaugh.log", `[${date} ERROR] (unknown): ${log_text_split[i]}\n`, 'utf8');
    }

    try {
        let bot = new Discord.Client()

        bot.on("ready", ready => {
            bot.channels.cache.get("1008343948093313076").send(`@everyone **${e}** \`\`\`js\n${e.stack}\`\`\` `)
        })
    } catch (err) {
        //console.log(err)
    }
    
}


process
    .on('unhandledRejection', (reason, p) => {
        console.log(reason, '[DBG] Unhandled Rejection at Promise', p);
        writeUncaughException(reason, "Unhandled Rejection (process.on handle)")
    })
    .on('uncaughtException', err => {
        console.log(err, '[DBG] Uncaught Exception thrown BBBBBBBBBB');
        writeUncaughException(err, "Uncaught Exception (process.on handle)")
    });

const Discord = require("discord.js")
const discordInv = require('discord-inv');
let _normalize = require('normalize-strings');
let Intents = Discord.Intents
let EmbedBuilder = Discord.EmbedBuilder
const fs = require("fs");
//const { SlashCommandBuilder } = require("discordjs/builders")
let somef = require('./localModules/someFunctions')
let botf = require('./bot/botLocalModules/botFunctions')
const axios = require("axios")


/*
https://discord.com/api/oauth2/authorize?client_id=968799075686289409&permissions=2147601409&scope=bot%20applications.commands

ADMIN:
https://discord.com/api/oauth2/authorize?client_id=968799075686289409&permissions=8&scope=bot%20applications.commands
*/

let Logger = new (require("./localModules/logger"))()
const Database = require("./localModules/database");
const MongoClient = require('mongodb').MongoClient;

let url = process.env.MONGODB_URL


Logger.info("=======================================")
Logger.info("========== [Starting script] ==========")
Logger.info("=======================================")


const server = require("./server")

const Modules = {
    "config": config,
    "somef": somef,
    "botf": botf,
    "_normalize": _normalize,
    "Database": Database,
    "Discord": Discord,
    "discordInv": discordInv,
    "server": server,
    "axios": axios
}


let bot = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.DirectMessageReactions,
        Discord.GatewayIntentBits.DirectMessageTyping,
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.GuildBans,
        Discord.GatewayIntentBits.GuildEmojisAndStickers,
        Discord.GatewayIntentBits.GuildIntegrations,
        Discord.GatewayIntentBits.GuildInvites,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.GuildMessageTyping,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildPresences,
        Discord.GatewayIntentBits.GuildScheduledEvents,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildWebhooks,
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.MessageContent
    ],
    partials: [
        Discord.Partials.Channel,
        Discord.Partials.GuildMember,
        Discord.Partials.GuildScheduledEvent,
        Discord.Partials.Message,
        Discord.Partials.Reaction,
        Discord.Partials.ThreadMember,
        Discord.Partials.User
    ],
    presence: {
      status: 'idle',
      activity: {
        name: `le démarrage...`,
        type: 'WATCHING'
      }
    }
})


function isSuperAdmin(id) {
    if (config.superAdminList.indexOf(id) != -1) return true
    return false
}

Object.size = function(arr) {
    var size = 0;
    for (var key in arr) {
        if (arr.hasOwnProperty(key)) size++;
    }
    return size;
};



Logger.info("Tentative de connection à MongoDB...")
MongoClient.connect(url, function(err, Mongo) {
    if (err) throw err
    Database._setMongoClient(Mongo)
    Database._useDb("DBGCanary")
    Logger.info("  Mongo instance connected.")
    _allCode()
})


function _allCode() {
    /*
    */

    bot.on("debug", (...args) => {
        Logger.debug("[BOT.debug]",...args)
    })


    bot.commands = {}
    bot.commands.slashCommands = new Discord.Collection();

    let SlashCommandsCollection = []
    
    fs.readdirSync("./bot/slashcommands").forEach(file => {
        if(file.endsWith(".js")) {
            try {
                let fileName = file.split(".")
                fileName.pop()
                fileName.join(".")

                temp = require(`./bot/slashcommands/${fileName}`)
                SlashCommandsCollection.push({
                    commandInformations: temp.commandInformations,
                    require: temp
                });
                bot.commands.slashCommands.set(temp.commandInformations.commandDatas.name, {
                    commandInformations: temp.commandInformations,
                    require: temp
                });
                Logger.info(`✔ Successfully loaded command ${temp.commandInformations.commandDatas.name}`)
            } catch(e) {
                Logger.warn(`❌ Failed loading command of file /slashcommands/${file}`,e)
            }
        }
    });
 
    bot.on("ready", () => {
        Logger.info(`[BOT]: Bot démarré en tant que ${bot.user.tag}`)
        //console.log(`Bot démarré en tant que ${bot.user.tag} | ${Object.size(bot.guilds.cache)} serveurs rejoints`)

        checkAnRecreateInvites()
        setInterval(checkAnRecreateInvites, 1000 * 3600 * 1)
        
        
        try {

            if(config.bot.setApplicationCommandsOnStart) {
                Logger.warn("❕ Penser à désactiver le config.bot.setApplicationCommandsOnStart pour ne pas recharger les commandes à chaque démarrage.")
                let commandDatas_ = SlashCommandsCollection.map(x => { return x.commandInformations.commandDatas })
                if(config.bot.setApplicationCommandsInLocal) {
                    for(let i in config.bot.setApplicationCommandsInLocal_guilds) {
                        let guild = bot.guilds.cache.get(config.bot.setApplicationCommandsInLocal_guilds[i])
                        try {
                            guild.commands.set(commandDatas_)
                            Logger.info(`✔ Successfully reloaded guild commands for ${guild.name} (${guild.id})`)
                        } catch(e) {
                            try {
                                Logger.warn(`❌ Failed to reload guild commands for ${guild.name} (${guild.id})`,e)
                            } catch(err) {
                                Logger.warn(`❌❌ Failed to reload guild commands for UNKNOW guild`,e)
                            }
                        }
                    }
                } else {
                    try {
                        bot.application.commands.set(commandDatas_)
                        Logger.info(`✔ Successfully reloaded global application commands.`)
                    } catch(e) {
                        Logger.warn(`❌ Failed to reload global application commands.`,e)
                    }
                }
            }
            Logger.info("✅ Chargement des slash commandes terminé")

        } catch(e) {
            Logger.debug(e)
        }
    })



    bot.on("interactionCreate", async (interaction) => {

        if(!interaction.guild) return;
        if(interaction.user.bot) return;

        interaction.guild.me_ = () => { return interaction.guild.members.cache.get(bot.user.id) }

        Logger.debug("interaction [command]",interaction)
    
        let data = await Database.getGuildDatas(interaction.guild.id)
    
        Logger.debug("Got interaction: "+interaction)
    
        if(!interaction.isCommand()) return;

        console.log("interaction.command",interaction.command)

       



        let cmd = bot.commands.slashCommands.get(interaction.commandName)

        if(!cmd) {
            return interaction.reply({
                content: ":x: Commande inconnue. [code#01]",
                ephemeral: true
            })
        }

        let hasPerm_bot1 = botf.checkPermissionsInChannel(
            [ "VIEW_CHANNEL", "SEND_MESSAGES" ].concat(cmd.require.commandInformations.permisionsNeeded.bot),
            interaction.guild.me_(),
            interaction.channel,
            true
        )
        
        let hasPerm_bot2 = botf.checkPermissions(cmd.require.commandInformations.permisionsNeeded.bot, interaction.guild.me_(), true)
        let hasPerm_bot = {
            havePerm: hasPerm_bot1.havePerm && hasPerm_bot2.havePerm,
            missingPermissions: somef.removeDuplicates(hasPerm_bot1.missingPermissions.concat(hasPerm_bot2.missingPermissions))
        }

        //Logger.debug(`BOT checking perms: ${cmd.require.commandInformations.permisionsNeeded.bot} : `,hasPerm_bot)
        let hasPerm_user = botf.checkPermissions(cmd.require.commandInformations.permisionsNeeded.user, interaction.member)
        //Logger.debug(`BOT checking perms: ${cmd.require.commandInformations.permisionsNeeded.user} : `,hasPerm_user)

        if(!hasPerm_bot.havePerm) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("FF0000")
                        .setTitle(`🤖 Aie.. Le bot manque de permissions!`)
                        .setDescription(`Il a besoin des permissions suivantes:\n${hasPerm_bot.missingPermissions.map((x) => {
                            return `\`${x}\``
                        }).join(", ")}`)
                        .setFooter({ text: `Essayez de contacter un administrateur.` })
                ],
                ephemeral: false
            }).then(() => { }).catch(e => {
                interaction.reply({
                    content: [
                        `**🤖 Aie.. Le bot manque de permissions!**`,
                        `Il a besoin des permissions suivantes:`,
                        `${hasPerm_bot.missingPermissions.map((x) => {
                            return `\`${x}\``
                        }).join(", ")}`,
                        ``,
                        `_Essayez de contacter un administrateur._`
                    ].join("\n")
                })
            })
        }
        if(!hasPerm_user.havePerm && !somef.isSuperAdmin(interaction.user.id)) {
            return interaction.reply({
                content: `⛔ Halte! Tu n'a pas la permission d'utiliser cette commande.\nIl te manque une de ces permissions: ${cmd.require.commandInformations.permisionsNeeded.user.map((x) => {
                    return `\`${x}\``
                }).join(", ")}`,
                ephemeral: true
            })
        }
    
        /*
        let filtered = SlashCommandsCollection.filter(x => {
            return x.commandInformations.commandDatas.name == interaction.command.name
        })
        */
    
        
    
        if(cmd.require.commandInformations.superAdminOnly && !somef.isSuperAdmin(interaction.user.id)) {
            return interaction.reply({
                content: `⛔ Commande SUPER_ADMIN uniquement.`,
                ephemeral: true
            }) 
        }
        if(cmd.require.commandInformations.disabled && !somef.isSuperAdmin(interaction.user.id)) {
            return interaction.reply({
                content: `⛔ Commande désactivée.`,
                ephemeral: true
            }) 
        }
        if(cmd.require.commandInformations.indev && !somef.isSuperAdmin(interaction.user.id)) {
            return interaction.reply({
                content: `🛠 Commande en développement`,
                ephemeral: true
            }) 
        }


        if(!cmd || !cmd.require) {
            return interaction.reply({
                content: `:x: Commande non prise en charge.`,
                ephemeral: true
            })
        }

        
        cmd.require.execute(Modules, bot, interaction, data).catch(async err => {
            Logger.warn(`Command crashed`,err)
            let the_error_msg = {
                content: "",
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle(`:x: Woops, looks like the command crashed.`)
                        .setColor("FF0000")
                        .setDescription(`\`\`\`js\n${err.stack}\`\`\``)
                ]
            }
            try {
                await interaction.reply(the_error_msg)
            } catch(e) {
                await interaction.editReply(the_error_msg)
            }
        })

    })


    bot.on('interactionCreate', async interaction => {

        if (!interaction.isButton()) return;
        
        if(!interaction.guild) return;
        if(interaction.user.bot) return;

        interaction.guild.me_ = () => { return interaction.guild.members.cache.get(bot.user.id) }

        Logger.debug("Got interaction button: "+interaction)

        let data = await Database.getGuildDatas(interaction.guild.id)



        //console.log(interaction);
    });
















    server.run(bot)

    async function checkAnRecreateInvites() {

        let discordsList = await (await Database.getAllDiscords()).toArray()

        console.log("discordsList: (mapped prévisualisation) ", discordsList.map(discordObj => {
            return {
                _id: discordObj._id,
                guild: {
                    name: discordObj.guild.name,
                    id: discordObj.guild.id
                },
                owner: {
                    tag: discordObj.owner.tag,
                    id: discordObj.owner.id
                },
                settings: discordObj.settings
            }
        }))

        let maxCount = discordsList.length
        for (let i in discordsList) {
            let d = discordsList[i]

            let count = `(${parseInt(i)+1}/${maxCount})`


            Logger.debug("inviteURL", d.inviteURL)
            await somef.sleep(300)


            async function after_got_the_invite(invite, httpcode) {
                let validInvite = false
                if (invite) {
                    if (invite.expires_at == null) validInvite = true
                }

                Logger.info(`${count} ${d.guild.id} -> : ${validInvite ? "Valid invitation." : `Invalid:${httpcode}`} (${d.guild.name})`)

                let the_guild = bot.guilds.cache.get(d.guild.id)

                /*if(the_guild) {
                    Database.setValue(d._id, `averageMembers.total`)
                } else {
                    Database.set_isBotInGuild(d.guild.id, false)
                }*/
                if (the_guild && validInvite) {
                    Database.set_isBotInGuild(d.guild.id, true)
                    Database.updatePresenceCount(d._id, invite) // invite.approximate_presence_count
                } else {
                    if (!validInvite && httpcode == "429") {
                        Logger.info(`${count} ${d.guild.id} -> :   429 Rate Limited. No action. is a guild: ${!!the_guild} | validInvite: ${validInvite}`)
                        return;
                    } else if (the_guild && !validInvite) {
                        Database.updateInviteCode(the_guild)
                        Database.set_isBotInGuild(d.guild.id, true)
                        Logger.info(`${count} ${d.guild.id} -> :   Updated invite.`)
                    } else if (!the_guild && !validInvite) {
                        Database.set_isBotInGuild(d.guild.id, false)
                        Database.setInviteURL(d._id, "")
                        Logger.info(`${count} ${d.guild.id} -> :   Cannot update invite, bot is no longer on guild.`)
                    } else if (!the_guild && validInvite) {
                        Logger.info(`${count} ${d.guild.id} -> :   Bot is not on guild but invite is valid.`)
                        Database.updatePresenceCount(d._id, invite)
                    } else {
                        Logger.info(`${count} ${d.guild.id} -> :   Wtf i dont know. is a guild: ${!!the_guild} | validInvite: ${validInvite}`)
                    }
                }



            }


            discordInv.getInv(discordInv.getCodeFromUrl(d.inviteURL)).then(async invite => {

                await after_got_the_invite(invite, "200")

            }).catch(e => {

                after_got_the_invite(false, `${e}`)

            })

        }



    }


    bot.on("messageCreate", async (message) => {
        //if (inDev) return Logger.log("Message got, but in local dev")

        if (message.author.bot) return;
        if (!message.guild) return;

        message.guild.me_ = () => { return message.guild.members.cache.get(bot.user.id) }
        
        if (inDev) {
            Logger.log(`[message] message got, but in local dev so dont add it | [${message.guild.name.substr(0,15)}] <${message.author.tag}> ${message.content.substr(0,20)}`)
        } else {
            Database.addMessageOnGuild(message)
        }

        if(Math.random() < 0.1) { Database.updateDiscordDatas(message.guild) }

        if (message.mentions.has(bot.user) && !message.mentions.everyone) {
            return message.reply(`✨ Hey! I use slash commands. Type \`${config.bot.prefix}help\` or \`/help\` to see the help panel. `).then(msg => { setTimeout(() => { msg.delete() }, 10 * 1000) })
        }

        //if(message.author.id != "770334301609787392") return;


        if (!message.content.startsWith(config.bot.prefix)) return;
        
        /********************/
        let temp_lines = [
            `Si oui alors sache que toutes les commandes viennent de passer en commande slash !`,
            `Tape / pour afficher la liste des commandes.`,
            ``,
            `Si tu ne vois pas le bot dans les commandes slash demande à un administrateur de réinviter le bot par [ce lien](${config.bot.inviteURL} "Inviter le bot avec l'autorisation de créer des slash commandes").`,
            `Un problème avec le bot ? Ping Sylicium sur le [serveur d'assistance](https://discord.gg/AtSyeNVEab "Assitance")`
        ].join("\n")
        return message.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle(`Hey, essais-tu d'éxécuter une commande ?`)
                    .setColor("FF9800")
                    .setDescription(temp_lines)
                    .setFooter({ text: "Bot de référencement officiel des Discords DirtyBiologistanais." })
            ]
        }).then(msg => {
            setTimeout(() => { msg.delete()}, 60*1000)
        })
        /********************/

        let args = message.content.slice(config.bot.prefix.length).split(' ');
        let command = args.shift().toLowerCase();

        // Logger.log("command:",command)
        // Logger.log("args:",args)



        //Logger.info("message:",message)
        if (command == "help") {
            let commands = [
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
            ]
            let command_string_list = []        
            for (let i in commands) {
                command_string_list.push(`\`${commands[i].name}\` : *${commands[i].description}*`)
            }

            let command_string = command_string_list.join("\n")

            message.reply({ embeds:[
                new EmbedBuilder()
                    .setTitle("Page d'aide")
                    .setColor("FFFFFD")
                    .setDescription(command_string)
                    .setFooter({ text: "Référencement officiel des Discords DirtyBiologistanais."})
                    .setTimestamp()
            ]})

            return;
        } else if (command == "ping") {
            let latency = Date.now() - message.createdTimestamp

            if (latency < 0) {
                return message.channel.send(`**:ping_pong: Latency is ${latency}ms. API Latency is ${Math.round(bot.ws.ping)}ms. ❔**`)
            } else if (latency < 400) {
                return message.channel.send(`**:ping_pong: Latency is ${latency}ms. API Latency is ${Math.round(bot.ws.ping)}ms. :green_circle:**`)
            } else if (latency < 700) {
                return message.channel.send(`**:ping_pong: Latency is ${latency}ms. API Latency is ${Math.round(bot.ws.ping)}ms. :orange_circle:**`)
            } else if (latency < 1000) {
                return message.channel.send(`**:ping_pong: Latency is ${latency}ms. API Latency is ${Math.round(bot.ws.ping)}ms. :red_circle:**`)
            } else {
                return message.channel.send(`**:ping_pong: Latency is ${latency}ms. API Latency is ${Math.round(bot.ws.ping)}ms. ⚠**`)
            }
            return;
        } else if (command == "list") {
            let serverCount = server.getCachedDiscords().length
            message.reply("a",
                new EmbedBuilder()
                    .setColor("#4444FF")
                    .setDescription(`${serverCount} serveurs référencé, [consulter la liste des serveurs de la micronation 🌎](${config.website.url})`)
                    .setFooter({ text: "Référencement officiel des Discords DirtyBiologistanais."})
                    .setTimestamp()
            )
            return;
        } else if (command == "info") {
            return message.reply(`:x: Cette commande n'est pas encore disponible.`)
            return;
        } else if (command == "search") {
            return message.reply(`:x: Cette commande n'est pas encore disponible.`)

        } else if (command == "unreferenceguild") {

            let perms = ["ADMINISTRATOR", "MANAGE_GUILD"]
            let haveOnePerm = false
            for (let i in perms) {
                if (message.member.hasPermission(perms[i])) haveOnePerm = true
            }

            if (!haveOnePerm && !isSuperAdmin(message.author.id)) {
                return message.reply(`Vous n'avez pas la permission d'utiliser cette commande. \`ADMINISTRATOR\` or \`MANAGE_GUILD\` `)
            }

            let traitement_en_cours = `${config.emojis.loading.tag} Traitement de la demande en cours...`
            let msg = await message.reply(traitement_en_cours)
            setTimeout(() => {
                if (msg.content == traitement_en_cours) msg.content = `${config.emojis.no.tag} La requête a pris trop de temps. Réessayez ultérieurement.`
            }, 60 * 1000)

            let isReferenced = await Database.isReferencedGuild(message.guild.id)
            if (!isReferenced) {
                message.reply(`:x: Ce serveur n'est déjà pas référencé.`)
                return;
            }

            let initial_msg = `Vous êtes sur le point de supprimer ce Discord du référencement listant tous les Discords DirtyBiologistanais, êtes vous sûr de vouloir faire ça ?`

            msg.edit(initial_msg).then(msg1 => {
                msg1.react("✅")
                msg1.react("❌")
                msg1.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '✅' || reaction.emoji.name == '❌'), { max: 1, time: 60 * 1000 })
                    .then(async collected => {
                        if (collected.first().emoji.name == '✅') {
                            msg1.reactions.removeAll().catch(e => { Logger.debug("Missing Permission to clear reactions") })

                            Database.deleteReferencedGuild(message.guild.id)

                            msg1.edit(`Le Discord n'est désormais plus référencé.`)
                            return;
                        } else {
                            msg1.reactions.removeAll().catch(e => { Logger.debug("Missing Permission to clear reactions") })
                            msg1.edit(`${initial_msg}\n\n:x: Vous avez annulé la commande.`)
                            return;
                        }

                    }).catch((e) => {
                        msg1.edit(`${initial_msg}\n\n:x: Annulé car vous avez mis trop de temps.`)
                        return;
                    })
            })


        } else if (command == "referenceguild") {

            let perms = ["ADMINISTRATOR", "MANAGE_GUILD"]
            let haveOnePerm = false
            for (let i in perms) {
                if (message.member.hasPermission(perms[i])) haveOnePerm = true
            }

            if (!haveOnePerm && !isSuperAdmin(message.author.id)) {
                return message.reply(`Vous n'avez pas la permission d'utiliser cette commande. \`ADMINISTRATOR\` or \`MANAGE_GUILD\` `)
            }

            let traitement_en_cours = `${config.emojis.loading.tag} Traitement de la demande en cours...`
            let msg = await message.reply(traitement_en_cours)
            setTimeout(() => {
                if (msg.content == traitement_en_cours) msg.content = `${config.emojis.no.tag} La requête a pris trop de temps. Réessayez ultérieurement.`
            }, 60 * 1000)

            let isReferenced = await Database.isReferencedGuild(message.guild.id)
            if (isReferenced) {
                msg.edit(`${config.emojis.check_mark.tag} Ce serveur est déjà référencé.`)
                return;
            }

            let back_msg_actions = []

            let contrat = [
                "\`Une invitation infinie pour ce serveur sera créée, et automatiquement recréée si nécessaire. Ce qui veut dire que ce serveur sera public et que n'importe qui pourra le rejoindre. (sauf si le mode privé est activé)\`",
                "**EXPULSER LE BOT N'ARRETERA PAS LE REFERENCEMENT**",
                "\`Le référencement durera jusqu'à son annulation par la commande prévue à cet effet, ou exceptionnellement l'intervention du développeur.\`",
                "\`Le Discord sera par défaut non certifié, c'est à dire qu'il n'aura pas encore été vérifié par le développeur en tant qu'un discord DirtyBiologistanais.\`",
                "\`Pour le principe évoqué au dessus, il est possible que le développeur rejoigne le serveur après son référencement pour le certifier.\`",
                "\`La certification assure que le serveur traite effectivement de près ou de loin au DirtyBiologistan.\`",
                "\`Le nombre de membre total approximatif ainsi qu'actuellement en ligne sera publiquement affiché\`",
                "\`Le nombre de messages envoyés les 7 et 31 derniers jours sera également affiché publiquement. (Aucun message n'est sauvegardé, uniquement le nombre)\`"
            ]

            for (let i in contrat) {
                contrat[i] = `**${parseInt(i) + 1}/** ${contrat[i]}`
            }
            let closes_contrat = contrat.join("\n")


            let initial_msg = `Vous allez référencer ce Discord en tant que Discord autour de la micro-nation du DirtyBiologistan.\n**Attention** cela implique les choses suivantes:\n${closes_contrat}\nCliquez sur :white_check_mark: si vous acceptez ces termes et pour référencer le Discord.`

            msg.edit(initial_msg).then(msg1 => {
                msg1.react("✅")
                msg1.react("❌")
                msg1.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '✅' || reaction.emoji.name == '❌'), { max: 1, time: 60 * 1000 })
                    .then(async collected => {
                        if (collected.first().emoji.name == '✅') {
                            msg1.reactions.removeAll().catch(e => { Logger.debug("Missing Permission to clear reactions") })


                            msg1.edit(`${config.emojis.loading.tag} Référencement en cours... cela peut prendre un moment.`).then(async msg2 => {


                                back_msg_actions.push("> Création d'une invitation permanente")
                                let the_invite;
                                try {
                                    the_invite = await message.channel.createInvite({
                                        maxAge: 0,
                                        maxUses: 0
                                    })
                                } catch(e) {
                                    back_msg_actions.push(`   Impossible de créer l'invitation: ${e}`)
                                }
                                Logger.log("the_invite created:", the_invite)

                                if (the_invite) {
                                    back_msg_actions.push(`   Invitation créé avec le code ${the_invite.code}`)
                                } else {
                                    back_msg_actions.push(`   Une erreur est survenue.`)
                                    back_msg_actions.push(`   Le bot tentera de réactualiser l'invitation plus tard.`)
                                }

                                let total_members = 0
                                let online_members = 0

                                back_msg_actions.push(`> Récupération du nombre approximatif de membres`)

                                let invite = false
                                try {
                                    invite = await discordInv.getInv(discordInv.getCodeFromUrl(the_invite.url))
                                    back_msg_actions.push(`   Récupération effectuée. ${invite.approximate_presence_count} membres connectés sur ${invite.approximate_member_count}.`)
                                } catch (e) {
                                    Logger.debug("error:", e)
                                    if (`${e}` == "429") {
                                        back_msg_actions.push(`   Une erreur est survenue: code ${e} | RateLimited`)
                                        back_msg_actions.push(`   Le bot tentera de réactualiser le nombre de membres plus tard.`)
                                    } else if (`${e}` == "404") {
                                        back_msg_actions.push(`   Une erreur est survenue: code ${e} | Invitation introuvable`)
                                        back_msg_actions.push(`   Le bot tentera de réactualiser le nombre de membres plus tard.`)
                                    } else {
                                        back_msg_actions.push(`   Une erreur est survenue: code ${e}`)
                                        back_msg_actions.push(`   Le bot tentera de réactualiser le nombre de membres plus tard.`)
                                    }
                                }

                                if (invite) {
                                    Logger.debug("adding")
                                    total_members = invite.approximate_member_count
                                    online_members = invite.approximate_presence_count
                                }

                                back_msg_actions.push(`> Envoi des informations au serveur pour le référencement`)
                                await Database.referenceGuild({
                                    guild: {
                                        id: message.guild.id,
                                        name: message.guild.name,
                                        iconURL: message.guild.iconURL(),
                                        createdAt: message.guild.createdAt.getTime(),
                                        description: ""
                                    },
                                    friendlyName: message.guild.name,
                                    keywords: message.guild.name.toLowerCase().split(" "),
                                    owner: {
                                        id: message.guild.owner.id,
                                        username: message.guild.owner.user.username,
                                        tag: message.guild.owner.user.tag,
                                        discriminator: message.guild.owner.user.discriminator
                                    },
                                    statistics: {
                                        messages: {
                                            lastWeek: [],
                                            lastMonth: []
                                        }
                                    },
                                    inviteURL: the_invite.url,
                                    averageMembers: {
                                        total: total_members,
                                        online: online_members
                                    },
                                    settings: {
                                        referencedAt: Date.now(),
                                        referencedBy: {
                                            id: message.author.id,
                                            username: message.author.username,
                                            tag: message.author.tag,
                                            discriminator: message.author.discriminator
                                        },
                                        isBotOnGuild: true,
                                        certified: false,
                                        private: false
                                    }
                                })
                                back_msg_actions.push("   Terminé")
                                back_msg_actions.push("")


                                let done_msg = [
                                    `${config.emojis.check_mark.tag} Serveur référencé avec succès!`,
                                    `Vous pouvez consulter la liste des serveurs via le lien ci dessous.`,
                                    `La liste est actualisée toutes les heures alors pas de panique si votre serveur n'y est pas encore.`,
                                    `Pour passer le serveur en **privé** et ne pas permettre de le rejoindre via le site, utilisez la commande \`${config.bot.prefix}setprivate\` `,
                                    //`Pour changer la description du serveur ou ses mots clés, utilisez la commande \`${config.bot.prefix}setdescription\` et \`${config.bot.prefix}setkeywords\` `
                                ].join("\n")

                                msg2.edit(done_msg,
                                    new EmbedBuilder()
                                        .setColor("#4444FF")
                                        .setDescription(`[Liste des serveurs de la micronation 🌎](${config.website.url})\n**Informations additionnelles:**\nLogs:\`\`\`\n${back_msg_actions.join('\n')}\`\`\` `)
                                        .setFooter({ text: "Référencement officiel des Discords DirtyBiologistanais."})
                                        .setTimestamp()
                                )


                            }).catch(err => {
                                Logger.error(err)

                                msg1.edit(`${config.emojis.no.tag} Une erreur est survenue durant le référencement du Discord. Si l'erreur persiste contactez le développeur du bot.`)
                                msg1.reply("a",
                                    new EmbedBuilder()
                                        .setColor("#4444FF")
                                        .setDescription(`🌎 Liste des serveurs de la micronation: ${config.website.url}\n**Informations additionnelles:**\nErreur: \`\`\`js\n${err}\`\`\` \nLogs:\`\`\`\n${back_msg_actions.join('\n')}\`\`\` `)
                                        .setFooter({ text: "Référencement officiel des Discords DirtyBiologistanais."})
                                        .setTimestamp()
                                ).catch(e => {
                                    back_msg_actions.push(`An error occured while handling error: Can't send embed message.`)
                                    msg1.reply(`[Liste des serveurs de la micronation 🌎](${config.website.url})\n**Informations additionnelles:**\nErreur: \`\`\`js\n${err}\`\`\` \nLogs:\`\`\`\n${back_msg_actions.join('\n')}\`\`\` `)
                                })


                            })


                        } else {
                            msg1.reactions.removeAll().catch(e => { Logger.debug("Missing Permission to clear reactions") })
                            msg1.edit(`${initial_msg}\n\n:x: Vous avez annulé la commande.`)
                            return;
                        }

                    }).catch((e) => {
                        msg1.edit(`${initial_msg}\n\n:x: Annulé car vous avez mis trop de temps.`)
                        return;
                    })



            })

        } else if (command == "setdescription") {

            let perms = ["ADMINISTRATOR", "MANAGE_GUILD"]
            let haveOnePerm = false
            for (let i in perms) {
                if (message.member.hasPermission(perms[i])) haveOnePerm = true
            }

            if (!haveOnePerm && !isSuperAdmin(message.author.id)) {
                return message.reply(`Vous n'avez pas la permission d'utiliser cette commande. \`ADMINISTRATOR\` or \`MANAGE_GUILD\` `)
            }

            let traitement_en_cours = `${config.emojis.loading.tag} Traitement de la demande en cours...`
            let msg = await message.reply(traitement_en_cours)
            setTimeout(() => {
                if (msg.content == traitement_en_cours) msg.content = `${config.emojis.no.tag} La requête a pris trop de temps. Réessayez ultérieurement.`
            }, 60 * 1000)

            let isReferenced_guildMongoDbObject = await Database.isReferencedGuild(message.guild.id)

            if (!isReferenced_guildMongoDbObject) {
                return msg.edit(`${config.emojis.no.tag} Ce discord n'est pas référencé, veuillez au préalable exécuter la commande \`${config.bot.prefix}referenceguild\`.`)
            }

            if(args[0]) {
                let new_description = args.join(" ")
                let maxLength = 255
                if(new_description.length > maxLength) {
                    msg.edit("a",
                        new EmbedBuilder()
                            .setColor("FF0000")
                            .setDescription(`${config.emojis.no.tag} La description doit faire au maximum ${maxLength} caractère, la votre en fait ${new_description.length} !\n${new_description.substr(0,maxLength)}__${new_description.substr(maxLength,new_description.length)}__`)
                    )
                    return;
                }
                await Database.set_descriptionGuildByID(message.guild.id, new_description)
                
                msg.edit("a",
                    new EmbedBuilder()
                        .setColor("00FF00")
                        .setDescription(`${config.emojis.check_mark.tag} La description a été changée pour \`\`\`${new_description}\`\`\` `)
                )
                return;
            } else {
                return msg.edit(`Erreur de syntaxe: \`${config.bot.prefix}setdescription <description>\` `)
            }

        
        } else if(command == "checkperms") {
            let checkedPerms = botf.checkPermissionList(message.guild.me_())
            message.channel.send(`Le bot necessite la permission | le bot a la permission\n${checkedPerms.list.join("\n")}`)
            if(checkedPerms.permissions_missing.length > 0) {
                message.channel.send(`Liste des permissions manquantes au bot: \`${checkedPerms.permissions_missing.join("\`, \`")}\` `)
            }
            return;
        } else if (command == "test") {
            if (!isSuperAdmin(message.author.id)) return;

            message.channel.send("a",

                new EmbedBuilder()
                    .setTitle(`Référencement des Discords DirtyBiologistanais`)
                    .setColor("#4444FF")
                    .setDescription(`Merci d'avoir ajouté le bot.\n\n__**Configurer le bot:**__\n\nLe préfix est \`${config.bot.prefix}\`. Faites \`${config.bot.prefix}help\` pour afficher les commandes.
        > 1) Pour référencer ce serveur faites \`${config.bot.prefix}referenceguild\`. Le serveur deviendra alors public sur le site web qui liste les Discords.
        > 2) Pour dé-référencer le Discord faites \`${config.bot.prefix}unreferenceguild\`, ou dans un cas urgent ou exceptionnel, contactez le développeur sur le [serveur d'assistance](https://discord.gg/hVh74Y4CgT).
        
        **:warning: ATTENTION, EXPULSER LE BOT DU SERVEUR N'ARRETERA PAS LE RÉFÉRENCEMENT DE CELUI CI SUR LE SITE; voir 2.**
        La certification est donnée après que le développeur ai vérifié que le Discord traite bien du DirtyBiologistan. Pour toute autre question allez sur le serveur d'assistance.
        
        Ce bot a été développé par \`Sylicium#3980\` (<@770334301609787392>) / \`Sylicium#2487\` (<@774003919625519134>)
        
        __**Autres liens:**__
        🌎 Sites: [Liste des serveurs de la micro-nation](${config.website.url}) • [site du DirtyBiologistan](https://DirtyBiology.captaincommand.repl.co) • [dirtybiologistan.com](https://dirtybiologistan.com)
        🔵 Discords: [Centre de renseignement](https://discord.gg/em9caYCg7D) • [Assistance des bots](https://discord.gg/hVh74Y4CgT) • [RPDB](https://discord.gg/hVh74Y4CgT) • [ORU](https://discord.gg/ZWHdEKxe7w) 
        `)
                    .setFooter({ text: "Référencement officiel des Discords DirtyBiologistanais."})
                    .setTimestamp()
            )
        } else if (command == "certify") {
            if (!isSuperAdmin(message.author.id)) return message.reply(`Vous n'avez pas la permission d'utiliser cette commande. \`SUPER_ADMIN\` `)

            if (!args[0]) return message.reply(`Erreur de syntaxe: \`${config.bot.prefix}certify <guild_id>\` `)

            guild_id = args[0]

            let isReferenced_guildMongoDbObject = await Database.isReferencedGuild(guild_id)

            if (isReferenced_guildMongoDbObject) {
                let isCertified = await Database.isCertifiedGuild(guild_id)
                if (isCertified) {
                    Database.set_certifiedGuildByID(guild_id, false)
                    message.reply("a",
                        new EmbedBuilder()
                            .setColor("FF0000")
                            .setDescription(`La guilde **${isReferenced_guildMongoDbObject.guild.name}** n'est désormais plus certifiée.`)
                    )
                    return;
                } else {
                    Database.set_certifiedGuildByID(guild_id, true)
                    message.reply("a",
                        new EmbedBuilder()
                            .setColor("00FF00")
                            .setDescription(`La guilde **${isReferenced_guildMongoDbObject.guild.name}** est maintenant certifiée ${config.emojis.check_mark.tag}.`)
                    )
                    return;
                }
            } else {
                return message.reply(`:x: La guilde avec l'ID \`${guild_id}\` n'est pas référencée ou l'ID est invalide.`)
            }
        } else if (command == "forcerefresh") {
            if (!isSuperAdmin(message.author.id)) return message.reply(`Vous n'avez pas la permission d'utiliser cette commande. \`SUPER_ADMIN\` `)
            message.reply(`${config.emojis.loading.tag} Rafraîchissement du cache...`).then(async msg => {
                let discordCached = await server.refreshDiscords_cache()
                msg.edit(`${config.emojis.check_mark.tag} Opération terminée, ${discordCached.length} discords rafraîchis en cache.`)
            }).catch(e => {
                console.log(e)
                msg.edit(`:x: Une erreur est survenue durant le rafraîchissement du cache: \`\`\`js\n${e}\`\`\` `)
            })
            return;

        } else if (command == "forcediscorddataupdate") {
            if (!isSuperAdmin(message.author.id)) return message.reply(`Vous n'avez pas la permission d'utiliser cette commande. \`SUPER_ADMIN\` `)
            
            message.reply(`${config.emojis.loading.tag} Rafraîchissement des informations de tous les serveurs discord...`).then(async msg => {
                await Database.updateDiscordDatas_allGuilds()
                msg.edit(`${config.emojis.check_mark.tag} Opération terminée, les données de ${discordCached.length} discords ont été rafraîchies.`)
            }).catch(e => {
                console.log(e)
                msg.edit(`:x: Une erreur est survenue durant le rafraîchissement des informations: \`\`\`js\n${e}\`\`\` `)
            })
            return;

        } else if (command == "setprivate") {

            let perms = ["ADMINISTRATOR", "MANAGE_GUILD"]
            let haveOnePerm = false
            for (let i in perms) {
                if (message.member.hasPermission(perms[i])) haveOnePerm = true
            }

            if (!haveOnePerm && !isSuperAdmin(message.author.id)) {
                return message.reply(`Vous n'avez pas la permission d'utiliser cette commande. \`ADMINISTRATOR\` or \`MANAGE_GUILD\` `)
            }

            let traitement_en_cours = `${config.emojis.loading.tag} Traitement de la demande en cours...`
            let msg = await message.reply(traitement_en_cours)
            setTimeout(() => {
                if (msg.content == traitement_en_cours) msg.content = `${config.emojis.no.tag} La requête a pris trop de temps. Réessayez ultérieurement.`
            }, 60 * 1000)

            let guild_id = message.guild.id

            let isReferenced_guildMongoDbObject = await Database.isReferencedGuild(guild_id)

            if (!isReferenced_guildMongoDbObject) {
                return msg.edit(`${config.emojis.no.tag} Ce discord n'est pas référencé, veuillez au préalable exécuter la commande \`${config.bot.prefix}referenceguild\`.`)
            }

            let isPrivate = await Database.isPrivateGuild(message.guild.id)

            if (isPrivate) {
                Database.set_privateGuildByID(guild_id, false)
                msg.edit("a",
                    new EmbedBuilder()
                        .setColor("00FF00")
                        .setDescription(`${config.emojis.check_mark.tag}🌎 Le Discord **${isReferenced_guildMongoDbObject.guild.name}** est désormais public. Un lien d'invitation permanent vers ce Discord est disponible sur le [site web](${config.website.url}).\nL'actualisation sur le site peut prendre jusqu'à 1h.`)
                )
                return;
            } else {
                Database.set_privateGuildByID(guild_id, true)
                msg.edit("a",
                    new EmbedBuilder()
                        .setColor("FF0000")
                        .setDescription(`${config.emojis.check_mark.tag}⛔ Le Discord **${isReferenced_guildMongoDbObject.guild.name}** est maintenant privé, il n'est donc plus possible de le rejoindre par le [site web](${config.website.url}).\nAttention, le lien d'invitation continuera à être actualisé si besoin, même si il ne servira pas.\nL'actualisation sur le site peut prendre jusqu'à 1h.`)
                )
                return;
            }




        }




    });



    bot.on("guildCreate", async guild => {
        if (inDev) return Logger.log("[GuildCreate] but in local dev")

        function isThereWordsInto(text) {
            let l = ["général", "general", "discussion", "discussions", "géneral", "bienvenue"]
            for (let i in l) {
                if (text.toLowerCase().indexOf(l[i]) != -1) return true
            }
            return false
        }

        let one_channel;
        one_channel = guild.channels.cache.find(chan => (chan.type == "text" && isThereWordsInto(chan.name)));

        if (!one_channel) {
            one_channel = guild.channels.cache.find(chan => (chan.type == "text"));
        }
        if (!one_channel) {
            Logger.warn(`Can't found a channel to send the auto join message on guild ${guild.id} (${guild.name})`)
            return;
        }

        let subtext = []
        
        let checkedPerms = botf.checkPermissionList(message.guild.me_())

        if(checkedPerms.permissions_missing.length > 0) {
            subtext.push(`:warning: Attention, le bot ne possède pas toutes les permissions necessaire, celà peut empêcher son fonctionnement, merci de lui donner les permissions spécifiées dans la commande \`${config.bot.prefix}checkperms\` `)
        }

        one_channel.send("a",
            new EmbedBuilder()
                .setTitle(`Référencement des Discords DirtyBiologistanais`)
                .setColor("#4444FF")
                .setDescription(`Merci d'avoir ajouté le bot.\n\n__**Configurer le bot:**__\n\nLe préfix est \`${config.bot.prefix}\`. Faites \`${config.bot.prefix}help\` pour afficher les commandes.
            > 1) Pour référencer ce serveur faites \`${config.bot.prefix}referenceguild\`. Le serveur deviendra alors public sur le site web qui liste les Discords.
            > 2) Pour dé-référencer le Discord faites \`${config.bot.prefix}unreferenceguild\`, ou dans un cas urgent ou exceptionnel, contactez le développeur sur le [serveur d'assistance](https://discord.gg/hVh74Y4CgT).

            **:warning: ATTENTION, EXPULSER LE BOT DU SERVEUR N'ARRETERA PAS LE RÉFÉRENCEMENT DE CELUI CI SUR LE SITE; voir 2.**
            La certification est donnée après que le développeur ai vérifié que le Discord traite bien du DirtyBiologistan. Pour toute autre question allez sur le serveur d'assistance.

            Ce bot a été développé par \`Sylicium#3980\` (<@770334301609787392>) / \`Sylicium#2487\` (<@774003919625519134>)

            ${subtext.join("\n")}

            __**Autres liens:**__
            🌎 Sites: [Liste des serveurs de la micro-nation](${config.website.url}) • [site du DirtyBiologistan](https://DirtyBiology.captaincommand.repl.co) • [dirtybiologistan.com](https://dirtybiologistan.com)
            🔵 Discords: [Centre de renseignement](https://discord.gg/em9caYCg7D) • [Assistance des bots](https://discord.gg/hVh74Y4CgT) • [RPDB](https://discord.gg/hVh74Y4CgT) • [ORU](https://discord.gg/ZWHdEKxe7w) 
            `)
                .setFooter({ text: "Référencement officiel des Discords DirtyBiologistanais."})
                .setTimestamp()
        )




    });




} // AllCode


bot.login(config.bot.token)
