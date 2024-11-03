import { Colors, EmbedBuilder } from "discord.js";
import { readFile } from "node:fs/promises";
import { countOccurrences } from "./picks.ts";
import { Helper } from "../../lib/helper.ts";

const helper = new Helper();
export async function makeGamemodeEmbed(
    occurance: { [key: string]: number },
    name: string,
    total: number
) {
    // get non-nerd top 6 picks
    let genpick = "";
    let counter = 1;
    for (const brawler of Object.entries(occurance)) {
        genpick += `${brawler[0]}`;
        if (counter == 6) {
            break;
        }
        counter++;
        genpick += ", ";
    }
    // get non-nerd general top 6 bans
    counter = 1;
    const bans = await helper.getGamemodeBans(name);
    const banOccurance = countOccurrences(bans);
    const banLength = bans.length;
    let genban = "";
    for (const brawler of Object.entries(banOccurance)) {
        genban += `${brawler[0]}`;
        if (counter == 6) {
            break;
        }
        counter++;
        genban += ", ";
    }
    // get total matches
    const all = JSON.parse(await readFile("db/matches.json", "utf8")).length;
    // create and send embed
    const embed = new EmbedBuilder()
        .setTitle(`<:bs_map:1291686752569921546> ${name}`)
        .setColor(Colors.Gold)
        .setDescription("Top picked brawlers for this gamemode")
        .setURL(`https://liquipedia.net/brawlstars/${name.split(" ").join("")}`)
        .addFields([
            {
                name: "<:time:1292086778550812672> General Info",
                value: `Total **games**: ${all}\nTotal **picks**: ${total}\nTotal **bans**: ${banLength}`,
            },
            {
                name: `<:brawlers:1291686735906078861> Picks on ${name}`,
                value: genpick,
            },
            {
                name: `<:bans:1291686740486131772> Bans on ${name}`,
                value: genban,
            },
        ]);
    return embed;
}

export async function makeMapEmbed(
    occurance: { [key: string]: number },
    name: string,
    total: number
) {
    // get non-nerd general to 6 picks
    let genpick = "";
    let counter = 1;
    for (const brawler of Object.entries(occurance)) {
        genpick += `${brawler[0]}`;
        if (counter == 6) {
            break;
        }
        counter++;
        genpick += ", ";
    }
    // get non-nerd general top 6 bans
    counter = 1;
    const banOccurance = countOccurrences(await helper.getMapBans(name));
    let genban = "";
    for (const brawler of Object.entries(banOccurance)) {
        genban += `${brawler[0]}`;
        if (counter == 6) {
            break;
        }
        counter++;
        genban += ", ";
    }
    // get total matches
    const all = JSON.parse(await readFile("db/matches.json", "utf8")).length;
    // create and send embed
    const embed = new EmbedBuilder()
        .setTitle(`<:bs_map:1291686752569921546> ${name}`)
        .setColor(Colors.Gold)
        .setDescription("Competitively viable picks for this map")
        .setURL(`https://liquipedia.net/brawlstars/${name.split(" ").join("")}`)
        .addFields([
            {
                name: "General Info",
                value: `Total **games**: ${all}\nTotal **picks**: ${total}`,
            },
            {
                name: `Picks on ${name}`,
                value: genpick,
            },
            {
                name: `Bans on ${name}`,
                value: genban,
            },
        ]);
    return embed;
}

export async function makeGamemodeEmbedNerdy(
    occurance: { [key: string]: number },
    field: string,
    name: string,
    total: number
) {
    /** Get old embed
     * get total matches
     * get ban occurances (since that's produced in this file
     * send embed
     */
    const embed = await makeGamemodeEmbed(occurance, name, total);
    const all = JSON.parse(await readFile("db/matches.json", "utf8")).length;
    const banOccurance = makeFields(
        countOccurrences(await helper.getGamemodeBans(name)),
        all
    );

    embed.setFields([
        {
            name: ":nerd: Stats for nerds - Picks",
            value: field,
        },
        {
            name: ":nerd: Stats for nerds - Bans",
            value: banOccurance,
        },
    ]);
    return embed;
}

export async function makeMapEmbedNerdy(
    occurance: { [key: string]: number },
    field: string,
    name: string,
    total: number
) {
    /** Get old embed
     * get total matches
     * get ban occurances (since that's produced in this file
     * send embed
     */
    const embed = await makeMapEmbed(occurance, name, total);
    const all = JSON.parse(await readFile("db/matches.json", "utf8")).length;
    const banfield = makeFields(countOccurrences(await helper.getMapBans(name)), all);
    embed.setFields([
        {
            name: ":nerd: Stats for nerds - Picks",
            value: field,
        },
        {
            name: ":nerd: Stats for nerds - Bans",
            value: banfield,
        },
    ]);
    return embed;
}

export function makeFields(
    occurance: { [key: string]: number },
    total: number
) {
    let field = "";
    for (const brawler of Object.entries(occurance)) {
        field += `**${brawler[0]}**: ${
            Math.round((brawler[1] / total) * 100 * 100) / 100
        }%`;

        if (Object.keys(occurance).indexOf(brawler[0]) == 14) {
            break;
        }
        if ((Object.keys(occurance).indexOf(brawler[0]) + 1) % 4 == 0) {
            field += ",\n";
            continue;
        }
        field += ", ";
    }
    return field;
}
