import { Events, Message, PermissionsBitField, TextChannel } from "discord.js";
import { BracketClass } from "../lib/messageEvents.ts";

export const name = Events.MessageCreate;

export async function execute(message: Message) {
    // if user doesn't have manage messages, get out;
    const guildID = message.guildId ?? "";
    const guild = await message.client.guilds.fetch(guildID);
    const member = guild.members.cache.get(message.author.id);
    if (
        !(member &&
            member.permissions.has(PermissionsBitField.Flags.ManageMessages))
    ) {
        return;
    }
    // get in now
    const helper = new BracketClass(message.content);
    const channel = message.client.channels.cache.get(
        message.channelId,
    ) as TextChannel;
    if (!helper.matches) {
        return;
    }
    try {
        for (const match of helper.matches) {
            if (match.startsWith("start") && helper.p("start", match)) {
                channel.send(helper.start(match));
            }
            if (match.startsWith("win") && helper.p("win", match)) {
                channel.send(helper.win(match));
            }
            if (match.startsWith("map")) {
                channel.send({
                    embeds: [await helper.map(match)],
                });
            } else if (match.startsWith("brawler")) {
                channel.send({
                    embeds: [await helper.brawler(match)],
                });
            } else if (match.startsWith("player")) {
                channel.send({
                    embeds: [await helper.player(match)],
                });
            } else if (match.startsWith("team")) {
                channel.send({
                    embeds: [await helper.team(match)],
                });
            } else if (match.startsWith("mendicendi")) {
                channel.send(
                    `mandi 👧\ncendi 🍬\nwandeezcendiez 🍭\nwiloluvmandezzcendiz 😍\ntessogudlooxsonays 😋\nbofafistforyormawthendurice 👁️ 👄 👁️\nhttps://www.youtube.com/watch?v=PyIDtCUiM5s`,
                );
            }
        }
    } catch (error) {
        console.error(error);
        channel.send("Something went wrong, please try again.");
    }
}
