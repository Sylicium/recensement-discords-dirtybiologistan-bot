module.exports = {
    bot: {
        prefix: "-",
        id: "",
        token: process.env["TOKEN"],
        setApplicationCommandsOnStart: true,
        setApplicationCommandsInLocal: true,
        setApplicationCommandsInLocal_guilds: [
            "909168225936363601"
        ]
    },
    server: {
        port: 80
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
        }
    }
}