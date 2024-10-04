import { helpTemplate } from "./template";
export async function helpHelpEmbed() {
    const helpEmbed = helpTemplate();
    helpEmbed.addFields({
        name: "Working",
        value: "Prints out the working of any command registed on this bot.",
    });
    helpEmbed.addFields({
        name: "Commands",
        value: "1. **Command** - the command you want to get help for. This does not necessarily require typing out the command, one can just select from the menu that appears",
    });
    return helpEmbed;
}
