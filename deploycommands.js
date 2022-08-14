
let Logger = new (require("./localModules/logger"))();

const { SlashCommandBuilder } = require("@discordjs/builders");
const {REST} = require("@discordjs/rest");
const {Routes} = require("discord-api-types/v9");
let config = require('./config');

let guildId = "909168225936363601";
let clientId = "968799075686289409";

const commands = [
    new SlashCommandBuilder().setName("ping").setDescription("A ping command")
].map(command => command.toJSON());

const rest = new REST({ version: "9" }).setToken(config.bot.token);

(async () => {
    try {
        await rest.put(Routes.applicationCommand(clientId, guildId), {body:commands})
        Logger.info("Success!")
    } catch(e) {
        console.log(e)
    }
})();