import type { Client } from "discord.js";
import { ActivityType, Events } from "discord.js";

export const name = Events.ClientReady;
export const once = true;

export function execute(client: Client) {
    client.user?.setStatus("dnd");
    client.user?.setPresence({
        activities: [
            {
                name: "kacky with the boys",
                type: ActivityType.Playing,
            },
        ],
        status: "dnd",
    });
    console.log("Bot has started as " + client.user?.username);
}
