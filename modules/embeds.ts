import type { APIEmbed, APIEmbedField, Client } from "discord.js";
import { Colors } from "discord.js";
import type { Brawler, Map, Match, Player, Pun, Team } from "./moduleTypes.ts";
import { EmbedBuilder } from "discord.js";
import { stringUtils } from "../utilities/stringUtils.ts";
import { Brawlify } from "./brawlify.ts";
import { LiquidDB } from "./liquid.ts";
import { findPrintableName } from "./mediawiki.ts";
import type { SquadPlayer } from "./moduleTypes.ts";
import { getBanList } from "../utilities/uilts.ts";
//match.ts
export function matchEmbedFields(
    match: Match[],
    matchNumber: number,
    gameNumber: number
) {
    if (match[matchNumber].match2games.length == 0) {
        return {
            name: "<:combat:1292086786872442973> Game not logged",
            value: "Games are not logged for this set.",
        };
    }
    const game = match[matchNumber].match2games[gameNumber];
    if (
        Object.values(game.participants).length !== 0 &&
        Object.values(game.scores).length !== 0
    ) {
        return {
            name: `<:combat:1292086786872442973> Game ${gameNumber + 1}`,
            value: `<:bs_map:1291686752569921546> **Played On** ${
                game.map
            }\n<:score:1291686732621676605> **Game Score**: ${game.scores[0]}:${
                game.scores[1]
            } - **${
                match[matchNumber].match2opponents[game.winner - 1].name
            }** won\n<:brawlers:1291686735906078861> **Picks**\n1. **${
                game.participants["1_1"].brawler
            }**, **${game.participants["1_2"].brawler}**, **${
                game.participants["1_3"].brawler
            }**\n2. **${game.participants["2_1"].brawler}**, **${
                game.participants["2_2"].brawler
            }**, **${
                game.participants["2_3"].brawler
            }**\n<:bans:1291686740486131772> **Bans**: ${getBanList(
                game.extradata
            )}`,
            inline: true,
        } as APIEmbedField;
    }
    throw new Error("matchNumber/gameNumber out of bounds");
}
// search.ts
export async function searchBrawler(query: string) {
    const obj = await Brawlify.get("brawler", query);
    const brawler = <Brawler>obj.result;
    if (!obj.queryExists || !obj.result) {
        return new EmbedBuilder()
            .setTitle("Brawler not found")
            .setColor(Colors.DarkRed)
            .setDescription(
                "Maybe you typed something wrong? If you are 100% sure you didn't type anything wrong, contact modmail."
            );
    }
    // Brawler definitely exists
    return new EmbedBuilder()
        .setTitle(
            `<:bsStar:1292082767848542208> ${brawler.name} <:bsStar:1292082767848542208>`
        )
        .setDescription(brawler.description)
        .setColor(Number("0x" + brawler.rarity.color.split("#")[1]))
        .setURL(
            ("https://www.liquipedia.net/brawlstars/" + brawler.name).replace(
                /\s/g,
                "%20"
            )
        )
        .setThumbnail(brawler.imageUrl)
        .addFields([
            {
                name:
                    "<:star_power:1276418263911497810> " +
                    brawler.starPowers[0].name,
                value: brawler.starPowers[0].description,
                inline: true,
            },
            {
                name:
                    "<:star_power:1276418263911497810> " +
                    brawler.starPowers[1].name,
                value: brawler.starPowers[1].description,
                inline: true,
            },
            {
                name: "\u200b",
                value: "\u200b",
                inline: true,
            },
            {
                name: `<:gadget:1276418294592573460> ${brawler.gadgets[0].name}`,
                value: brawler.gadgets[0].description,
                inline: true,
            },
            {
                name: `<:gadget:1276418294592573460> ${brawler.gadgets[1].name}`,
                value: brawler.gadgets[1].description,
                inline: true,
            },
            {
                name: "\u200b",
                value: "\u200b",
                inline: true,
            },
        ]);
}

export async function searchMap(query: string) {
    const obj = await Brawlify.get("map", query);
    const map = <Map>obj.result;
    if (!obj.queryExists || !obj.result) {
        return new EmbedBuilder()
            .setTitle("Map not found")
            .setColor(Colors.DarkRed)
            .setDescription(
                "Maybe you typed something wrong? If you are 100% sure you didn't type anything wrong, contact modmail."
            );
    }
    return new EmbedBuilder()
        .setTitle(
            `<:bs_map:1291686752569921546> ${map.name} <:bs_map:1291686752569921546>`
        )
        .setDescription(
            `> Gamemode: [${map.gamemode.name}](${map.gamemode.link})`
        )
        .setImage(map.imageUrl)
        .setURL(map.link)
        .setColor(Number("0x" + map.gamemode.color.split("#")[1]));
}

export async function searchPlayer(query: string) {
    const obj = await LiquidDB.get("player", query);
    const player = <Player>obj.result;
    if (!obj.queryExists || !obj.result) {
        return new EmbedBuilder()
            .setTitle("Player not found")
            .setColor(Colors.DarkRed)
            .setDescription(
                "Maybe you typed something wrong? If you are 100% sure you didn't type anything wrong, contact modmail."
            );
    }
    return new EmbedBuilder()
        .setTitle(`<:duels:1291683169569083392> ${player.id}`)
        .setDescription(
            `${
                player.pagename
            } is a member (player/coach/analyst) at **${await findPrintableName(
                player?.teampagename
            )}**.`
        )
        .setColor(player?.status == "Active" ? 0x4287f5 : 0xf54254)
        .setURL(`https://liquipedia.net/brawlstars/${player?.pagename}`)
        .setFooter({ text: "We do not have licenses to use player images." })
        .addFields([
            {
                name: "<:game:1291684262910885918> Team",
                value: `[${await findPrintableName(
                    player?.teampagename
                )}](https://liquipedia.net/brawlstars/${player.teampagename})`,
                inline: true,
            },
            {
                name: "<:living:1292086781071593515> Living in",
                value: player.nationality,
                inline: true,
            },
            {
                name: "<:money:1292086783886233621> Earnings",
                value: "$" + player.earnings,
                inline: true,
            },
            {
                name: "<:score:1291686732621676605> Socials",
                value: `[Twitter](${player.twitter})`,
                inline: true,
            },
        ]);
}

export async function searchTeam(query: string): Promise<EmbedBuilder> {
    const obj = await LiquidDB.get("team", query);
    const team = <Team>obj.result;
    if (team.status == "disbanded" ? true : false) {
        return new EmbedBuilder()
            .setTitle(`${getRandomTeamNameEmoji()} ${team.name}`)
            .setDescription(team.name + " is a **disbanded** team.")
            .setThumbnail(team.logodarkurl)
            .setColor(0xf54254)
            .addFields([
                {
                    name: "<:time:1292086778550812672> Disband date",
                    value: stringUtils.formatDate(team.disbanddate),
                    inline: true,
                },
                {
                    name: "<:living:1292086781071593515>  Region",
                    value: team.region,
                    inline: true,
                },
                {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true,
                },
                {
                    name: "<:game:1291684262910885918> Members",
                    value: "Disbanded team, no active members.",
                },
                {
                    name: "<:coach:1292130323806556272> Staff",
                    value: "Disbanded team, no active staff members.",
                },
                {
                    name: "<:score:1291686732621676605> Links",
                    value: Object.entries(team.links)
                        .map(
                            ([key, value]) =>
                                `[${
                                    key.charAt(0).toUpperCase() + key.slice(1)
                                }](${value})`
                        )
                        .join(", "),
                    inline: true,
                },
            ]);
    }
    return new EmbedBuilder()
        .setTitle(`${getRandomTeamNameEmoji()} ${team.name}`)
        .setURL(`https://liquipedia.net/brawlstars/${team.pagename}`)
        .setThumbnail(team.textlesslogodarkurl)
        .setColor(team.status == "Active" ? 0x4287f5 : 0xf54254)
        .addFields([
            {
                name: "<:time:1292086778550812672> Creation Date",
                value: stringUtils.formatDate(team.createdate),
                inline: true,
            },
            {
                name: "<:living:1292086781071593515>  Region",
                value: team.region,
                inline: true,
            },
            {
                name: "\u200b",
                value: "\u200b",
                inline: true,
            },
            {
                name: "<:game:1291684262910885918> Members",
                value: stringUtils.formatSquadPlayerInfo(
                    getActivePlayers(team)
                ),
            },
            {
                name: "<:coach:1292130323806556272> Coaches",
                value: stringUtils.formatStaff(getActiveStaff(team)),
            },
            {
                name: "<:score:1291686732621676605> Links",
                value: Object.entries(team.links)
                    .map(
                        ([key, value]) =>
                            `[${
                                key.charAt(0).toUpperCase() + key.slice(1)
                            }](${value})`
                    )
                    .join(", "),
                inline: true,
            },
        ]);
}
function getActivePlayers(team: Team) {
    const answer: SquadPlayer[] = [];
    for (const player of team.players) {
        if (player.type == "player") {
            answer.push(player);
        }
    }
    return answer;
}
function getActiveStaff(team: Team) {
    const answer: SquadPlayer[] = [];
    for (const player of team.players) {
        if (player.type == "staff") {
            answer.push(player);
        }
    }
    return answer;
}
// again, probably doesnt belong here - push to some utility class
export function getRandomTeamNameEmoji(): string {
    const emojiArray = [
        "<:badge1:1292091475823300670>",
        "<:badge2:1292091479262629958>",
        "<:badge3:1292091482035195946>",
        "<:badge4:1292091484472082502>",
        "<:badge5:1292091486946590793>",
        "<:badge6:1292091489697927228>",
        "<:badge7:1292091492269297676>",
        "<:badge8:1292091494865305622>",
        "<:badge9:1292091497210056745>",
        "<:badge10:1292091500532076627>",
    ];
    const randomIndex = Math.floor(Math.random() * emojiArray.length);
    return emojiArray[randomIndex];
}

export function predictEndEmbed(question: string, time: string): EmbedBuilder {
    const answer = new EmbedBuilder()
        .setTitle("Predictions Closed")
        .setDescription(
            `This prediction - ${question} - has received all the votes it could. Please come back for the next one!\nPrediction entries ran for ${time}.`
        )
        .setColor(0xf5428d)
        .setTimestamp();
    return answer;
}

export function predictCreateInitial(
    question: string,
    choice1: string,
    choice2: string,
    time: string
): EmbedBuilder {
    const answer = new EmbedBuilder()
        .setTitle(question)
        .setDescription(`Entries for this prediction **end in ${time}**`)
        .setColor(0x6441a5)
        .setFooter({ text: "Predict now!" })
        .setTimestamp()
        .setFooter({ text: "Voting requires 100 kash." })
        .addFields([
            {
                name: "Choice 1",
                value: choice1,
                inline: true,
            },
            {
                name: "Choice 2",
                value: choice2,
                inline: true,
            },
        ]);
    return answer;
}
export async function makePun(pun: Pun, client: Client<boolean>) {
    const embed = EmbedBuilder.from(<APIEmbed>pun.embed);
    embed.setThumbnail(
        "https://cdn.discordapp.com/avatars/" +
            pun.id +
            "/" +
            (await client.users.fetch(pun.id)).avatar
    );
    let catchp = "";
    for (const catcha of pun.random_quotes) {
        catchp += catcha + "\n";
    }
    embed.addFields([
        {
            name: "Things you might hear this person say",
            value: catchp,
        },
    ]);
    embed.setImage(
        "https://cdn.discordapp.com/avatars/" +
            pun.id +
            "/" +
            (await client.users.fetch(pun.id)).banner
    );
    return embed;
}
