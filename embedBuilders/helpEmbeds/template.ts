import { EmbedBuilder } from "discord.js";

export function helpTemplate(): EmbedBuilder {
    const answer = new EmbedBuilder()
        .setTitle("Help")
        .setColor(0x2ae873)
        .setDescription("Help for the requested command.")
        .setThumbnail("https://cdn-icons-png.flaticon.com/512/4945/4945118.png")
        .setFooter({ text: "Made with ❤️ by elephantoChan" });
    return answer;
}
