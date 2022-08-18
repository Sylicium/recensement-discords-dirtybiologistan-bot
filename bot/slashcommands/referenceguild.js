

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "referenceguild",
            description: "Référence votre serveur sur le site du centre de renseignement.",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: []
        },
        canBeDisabled: false,
        permisionsNeeded: {
            bot: ["SEND_MESSAGES"],
            user: ["ADMINISTRATOR", "MANAGE_GUILD"]
        },
        rolesNeeded: [],
        superAdminOnly: false,
        disabled: false,
        indev: false,
        hideOnHelp: false
    },
    execute: async (bot, interaction, data, a,b,c,d,e,f,g,h) => {

		await interaction.deferReply();
        
        interaction.editReply({ephemeral: false, content:`**💚 All's good**`})

        return;
        

        let perms = ["ADMINISTRATOR", "MANAGE_GUILD"]
        let haveOnePerm = false
        for (let i in perms) {
            if (message.member.hasPermission(perms[i])) haveOnePerm = true
        }

        if (!haveOnePerm && !isSuperAdmin(message.author.id)) {
            return message.inlineReply(`Vous n'avez pas la permission d'utiliser cette commande. \`ADMINISTRATOR\` or \`MANAGE_GUILD\` `)
        }

        let traitement_en_cours = `${config.emojis.loading.tag} Traitement de la demande en cours...`
        let msg = await message.inlineReply(traitement_en_cours)
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
                    msg1.reactions.removeAll().catch(e => { console.log("Missing Permission to clear reactions") })


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
                        console.log("the_invite created:", the_invite)

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
                            console.log("error:", e)
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
                            console.log("adding")
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
                            new MessageEmbed()
                                .setColor("#4444FF")
                                .setDescription(`[Liste des serveurs de la micronation 🌎](${config.website.url})\n**Informations additionnelles:**\nLogs:\`\`\`\n${back_msg_actions.join('\n')}\`\`\` `)
                                .setFooter("Référencement officiel des Discords DirtyBiologistanais.")
                                .setTimestamp()
                        )


                    }).catch(err => {
                        console.log(err)

                        msg1.edit(`${config.emojis.no.tag} Une erreur est survenue durant le référencement du Discord. Si l'erreur persiste contactez le développeur du bot.`)
                        msg1.inlineReply(
                            new MessageEmbed()
                                .setColor("#4444FF")
                                .setDescription(`🌎 Liste des serveurs de la micronation: ${config.website.url}\n**Informations additionnelles:**\nErreur: \`\`\`js\n${err}\`\`\` \nLogs:\`\`\`\n${back_msg_actions.join('\n')}\`\`\` `)
                                .setFooter("Référencement officiel des Discords DirtyBiologistanais.")
                                .setTimestamp()
                        ).catch(e => {
                            back_msg_actions.push(`An error occured while handling error: Can't send embed message.`)
                            msg1.inlineReply(`[Liste des serveurs de la micronation 🌎](${config.website.url})\n**Informations additionnelles:**\nErreur: \`\`\`js\n${err}\`\`\` \nLogs:\`\`\`\n${back_msg_actions.join('\n')}\`\`\` `)
                        })


                    })


                } else {
                    msg1.reactions.removeAll().catch(e => { console.log("Missing Permission to clear reactions") })
                    msg1.edit(`${initial_msg}\n\n:x: Vous avez annulé la commande.`)
                    return;
                }

            }).catch((e) => {
                msg1.edit(`${initial_msg}\n\n:x: Annulé car vous avez mis trop de temps.`)
                return;
            })


        })






    }
}
