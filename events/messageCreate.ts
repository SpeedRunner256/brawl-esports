import { Events, Message, PermissionsBitField, TextChannel } from "discord.js";
import { BracketClass } from "../modules/messageEvents.ts";

export const name = Events.MessageCreate;

export async function execute(message: Message) {
    // if user doesn't have manage messages, get out;
    const guildID = message.guildId ?? "";
    const guild = await message.client.guilds.fetch(guildID);
    const member = guild.members.cache.get(message.author.id);
    if (
        !(
            member &&
            member.permissions.has(PermissionsBitField.Flags.ManageMessages)
        )
    ) {
        return;
    }
    // get in now
    const he = new BracketClass(message.content);
    const channel = message.client.channels.cache.get(
        message.channelId
    ) as TextChannel;
    if (!he.matches) {
        return;
    }
    for (const match of he.matches) {
        if (match.startsWith("start") && he.p("start", match)) {
            channel.send(he.start(match));
        }
        if (match.startsWith("game") && he.p("game", match)) {
            channel.send(he.game(match));
        }
        if (match.startsWith("set") && he.p("set", match)) {
            channel.send(he.set(match));
        }
        if (match.startsWith("match") && he.p("end", match)) {
            channel.send(he.match(match));
        }
    }
}
