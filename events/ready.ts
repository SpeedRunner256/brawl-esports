import type { Client } from "discord.js";
import { ActivityType, Events } from "discord.js";

export const name = Events.ClientReady;
export const once = true;

export function execute(client: Client) {
    client.user?.setStatus("dnd");
    client.user?.setPresence({
        activities: [
            {
                name: "Serving data on the rocks",
                type: ActivityType.Custom,
            },
        ],
        status: "online",
    });
    console.log("Bot has started as " + client.user?.username);
}
