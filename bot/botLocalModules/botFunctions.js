
const Discord = require('discord.js');
const { PermissionsBitField } = Discord


module.exports.checkPermissions = checkPermissions
function checkPermissions(permissionList, Member, haveAll=false) {
    if(permissionList.length == 0) {
        return { missingPermissions: [], havePerm: true }
    }
    let json = {
        missingPermissions: [],
        havePerm: true
    }
    for(let i in permissionList) {
        let perm = permissionList[i]
        if(Member.permissions.has(getBitFieldPermission(perm))) { if(!haveAll) return { missingPermissions: [], havePerm: true} }
        else {
            json.havePerm = false
            json.missingPermissions.push(permissionList[i])
        }
    }
    return (haveAll ? json : { missingPermissions: [], havePerm: false})
}


let BitFieldPermissions_ = {
    //"CREATE_INSTANT_INVITES": PermissionsBitField.Flags.SendMessages

    "AddReactions": 64n,
    "Administrator": 8n,
    "AttachFiles": 32768n,
    "BanMembers": 4n,
    "ChangeNickname": 67108864n,
    "Connect": 1048576n,
    "CreateInstantInvite": 1n,
    "CreatePrivateThreads": 68719476736n,
    "CreatePublicThreads": 34359738368n,
    "DeafenMembers": 8388608n,
    "EmbedLinks": 16384n,
    "KickMembers": 2n,
    "ManageChannels": 16n,
    "ManageEmojisAndStickers": 1073741824n,
    "ManageEvents": 8589934592n,
    "ManageGuild": 32n,
    "ManageMessages": 8192n,
    "ManageNicknames": 134217728n,
    "ManageRoles": 268435456n,
    "ManageThreads": 17179869184n,
    "ManageWebhooks": 536870912n,
    "MentionEveryone": 131072n,
    "ModerateMembers": 1099511627776n,
    "MoveMembers": 16777216n,
    "MuteMembers": 4194304n,
    "PrioritySpeaker": 256n,
    "ReadMessageHistory": 65536n,
    "RequestToSpeak": 4294967296n,
    "SendMessages": 2048n,
    "SendMessagesInThreads": 274877906944n,
    "SendTTSMessages": 4096n,
    "Speak": 2097152n,
    "Stream": 512n,
    "UseApplicationCommands": 2147483648n,
    "UseEmbeddedActivities": 549755813888n,
    "UseExternalEmojis": 262144n,
    "UseExternalStickers": 137438953472n,
    "UseVAD": 33554432n,
    "ViewAuditLog": 128n,
    "ViewChannel": 1024n,
    "ViewGuildInsights": 524288n,
    
    "ADD_REACTIONS": 64n,
    "ADMINISTRATOR": 8n,
    "ATTACH_FILES": 32768n,
    "BAN_MEMBERS": 4n,
    "CHANGE_NICKNAME": 67108864n,
    "CONNECT": 1048576n,
    "CREATE_INSTANT_INVITE": 1n,
    "CREATE_PRIVATE_THREADS": 68719476736n,
    "CREATE_PUBLIC_THREADS": 34359738368n,
    "DEAFEN_MEMBERS": 8388608n,
    "EMBED_LINKS": 16384n,
    "KICK_MEMBERS": 2n,
    "MANAGE_CHANNELS": 16n,
    "MANAGE_EMOJIS_AND_STICKERS": 1073741824n,
    "MANAGE_EVENTS": 8589934592n,
    "MANAGE_GUILD": 32n,
    "MANAGE_MESSAGES": 8192n,
    "MANAGE_NICKNAMES": 134217728n,
    "MANAGE_ROLES": 268435456n,
    "MANAGE_THREADS": 17179869184n,
    "MANAGE_WEBHOOKS": 536870912n,
    "MENTION_EVERYONE": 131072n,
    "MODERATE_MEMBERS": 1099511627776n,
    "MOVE_MEMBERS": 16777216n,
    "MUTE_MEMBERS": 4194304n,
    "PRIORITY_SPEAKER": 256n,
    "READ_MESSAGE_HISTORY": 65536n,
    "REQUEST_TO_SPEAK": 4294967296n,
    "SEND_MESSAGES": 2048n,
    "SEND_MESSAGES_IN_THREADS": 274877906944n,
    "SEND_TTS_MESSAGES": 4096n,
    "SPEAK": 2097152n,
    "STREAM": 512n,
    "USE_APPLICATION_COMMANDS": 2147483648n,
    "USE_EMBEDDED_ACTIVITIES": 549755813888n,
    "USE_EXTERNAL_EMOJIS": 262144n,
    "USE_EXTERNAL_STICKERS": 137438953472n,
    "USE_VAD": 33554432n,
    "VIEW_AUDIT_LOG": 128n,
    "VIEW_CHANNEL": 1024n,
    "VIEW_GUILD_INSIGHTS": 524288n,
}


module.exports.getBitFieldPermission = getBitFieldPermission
function getBitFieldPermission(permNameOrList) {
    if(Array.isArray(permNameOrList)) {
        return permNameOrList.map((item, index) => {
            this.getBitFieldPermission(item)
        })
    } else {
        if(typeof permNameOrList != "string") return permNameOrList
        if(BitFieldPermissions_[permNameOrList] != undefined) {
            return BitFieldPermissions_[permNameOrList]
        } else {
            return permNameOrList
        }
    }

}


/**
 * createMdodal(modalConfiguration): renvoie l'objet de modal créé avec la liste d'option fournie
 * @version: 1.0.0
 * @param {Object} modalConfiguration - La liste des options du modal
*/
function createModal(modalConfiguration) {
    /*
    {
        customId: "ccc",
        title: "titre",
        options: [
            {
                customId: "test",
                label: "coucou",
                style: "short"
            }
        ]
    }
    */

    function getStyleFrom(styleName) {
        if(styleName == "short") {
            return Discord.TextInputStyle.Short
        } else if(styleName == "paragraph") {
            return Discord.TextInputStyle.Paragraph
        }
    }

    let modal = new Discord.ModalBuilder()
		.setCustomId(modalConfiguration.setCustomId)
		.setTitle(modalConfiguration.title);
    
    let allOptionsComponents = modalConfiguration.map((item, index) => {
        return new Discord.ActionRowBuilder().addComponents(
            new Discord.TextInputBuilder()
			.setCustomId(item.customId)
			.setLabel(item.label)
			.setStyle(getStyleFrom(item.style))
        )
    })

    modal.addComponents(...allOptionsComponents)
    
    return modal

}
module.exports.createModal = createModal


module.exports.checkPermissionList = checkPermissionList
function checkPermissionList(member) {

    let perm_list = [
{ name: "CREATE_INSTANT_INVITE", shouldHave: true },
{ name: "KICK_MEMBERS", shouldHave: false },
{ name: "BAN_MEMBERS", shouldHave: false },
{ name: "ADMINISTRATOR", shouldHave: false },
{ name: "MANAGE_CHANNELS", shouldHave: false },
{ name: "MANAGE_GUILD", shouldHave: false },
{ name: "ADD_REACTIONS", shouldHave: true },
{ name: "VIEW_AUDIT_LOG", shouldHave: false },
{ name: "PRIORITY_SPEAKER", shouldHave: false },
{ name: "STREAM", shouldHave: false },
{ name: "VIEW_CHANNEL", shouldHave: true },
{ name: "SEND_MESSAGES", shouldHave: true },
{ name: "SEND_TTS_MESSAGES", shouldHave: true },
{ name: "MANAGE_MESSAGES", shouldHave:true },
{ name: "EMBED_LINKS", shouldHave: true },
{ name: "ATTACH_FILES", shouldHave: true },
{ name: "READ_MESSAGE_HISTORY", shouldHave: true },
{ name: "MENTION_EVERYONE", shouldHave: false },
{ name: "USE_EXTERNAL_EMOJIS", shouldHave: true },
{ name: "USE_EXTERNAL_STICKERS", shouldHave: true },
{ name: "VIEW_GUILD_INSIGHTS", shouldHave: false },
{ name: "CONNECT", shouldHave: false },
{ name: "SPEAK", shouldHave: false },
{ name: "MUTE_MEMBERS", shouldHave: false },
{ name: "DEAFEN_MEMBERS", shouldHave: false },
{ name: "MOVE_MEMBERS", shouldHave: false },
{ name: "USE_VAD", shouldHave: false },
{ name: "CHANGE_NICKNAME", shouldHave: false },
{ name: "MANAGE_NICKNAMES", shouldHave: false },
{ name: "MANAGE_ROLES", shouldHave: false },
{ name: "MANAGE_WEBHOOKS", shouldHave: false },
{ name: "MANAGE_EMOJIS_AND_STICKERS", shouldHave: false },
{ name: "USE_APPLICATION_COMMANDS", shouldHave: true },
{ name: "REQUEST_TO_SPEAK", shouldHave: false },
{ name: "MANAGE_EVENTS", shouldHave: false },
{ name: "MANAGE_THREADS", shouldHave: false },
{ name: "CREATE_PUBLIC_THREADS", shouldHave: false },
{ name: "CREATE_PRIVATE_THREADS", shouldHave: false },
{ name: "SEND_MESSAGES_IN_THREADS", shouldHave: true },
{ name: "USE_EMBEDDED_ACTIVITIES", shouldHave: false },
{ name: "MODERATE_MEMBERS", shouldHave: false },
]
    let permissions_got = []
    let permissions_required = []
    let permissions_missing = []
    let text_list = []
    for(let i in perm_list) {
        let mini_em;
        let required = false
        if(perm_list[i].shouldHave) {
            mini_em = ":white_check_mark:"
            permissions_required.push(perm_list[i].name)
            required = true
        } else {
            mini_em = ":x:"
        }
        try {
            let permissionChecked = this.checkPermissions([perm_list[i].name], member)
            if(permissionChecked.havePerm) { //member.hasPermission(perm_list[i].name)
                text_list.push(`${mini_em} :white_check_mark: ${perm_list[i].name}`)
                permissions_got.push(perm_list[i].name)
            } else {
                text_list.push(`${mini_em} :x: ${perm_list[i].name}`)
                if(required) permissions_missing.push(perm_list[i].name)
            }
        } catch(e) {
            text_list.push(`${mini_em} :warning: ${perm_list[i].name}`)
            if(required) permissions_missing.push(perm_list[i].name)
        }
    }
    return {
        list: text_list,
        permissions: permissions_got,
        permissions_required: permissions_required,
        permissions_missing: permissions_missing,
    }

}