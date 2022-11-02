module.exports = {
    inDev: false,
    bot: {
        prefix: "r!",
        id: "",
        token: process.env["TOKEN"],
        setApplicationCommandsOnStart: false,
        setApplicationCommandsInLocal: true,
        setApplicationCommandsInLocal_guilds: [
            "909168225936363601",
            "981609125622452224"
        ],
        inviteURL: "https://discord.com/oauth2/authorize?client_id=968799075686289409&permissions=294205643841&scope=bot%20applications.commands"
    },
    server: {
        port: 3002,
    },
    api: {
        me: {
            api_token: process.env.API_TOKEN,
            endpoints: {
                dbsapiback: {
                    url: "https://ReferencementDBG.gouv.repl.co/api/dbsapiback",
                    method: "PUT"
                }
            }
        },
        dbs_api: {
            api_token: process.env.DBS_API_TOKEN,
            endpoints: {
                createPage: {
                    url: "https://dbs-api.captaincommand.repl.co/api/createSettingPage",
                    method: "POST"
                }
            }
        }
    },
    superAdminList: [
        "774003919625519134", // compte principal
        "770334301609787392", // dc
        "548121381896847370", // RORO
    ],
    website: {
        url: "https://referencementdbg.gouv.repl.co/"
    },
    emojis: {
        "loading": {
            id: "867530470438731827",
            tag: "<a:loading:867530470438731827>"
        },
        "check_mark": {
            id: "905859187580485662",
            tag: "<:check:905859187580485662>"
        },
        "no": {
            id: "",
            tag: "❌"
        },
        "bluebutton": {
            id:"",
            tag: "<:bluebutton:1009964954608214197>"
        },
        "whitebutton": {
            id:"",
            tag: "<:whitebutton:1009964968571043880>"
        },
        "whitebarleft": {
            id: "",
            tag: "<:whitebarleft:1009965122409730109>"
        },
        "whitebar": {
            id: "",
            tag: "<:whitebar:1009965136179642498>"
        },
        "whitebarright": {
            id: "",
            tag: "<:whitebarright:1009965128772493394>"
        }
    }
}
