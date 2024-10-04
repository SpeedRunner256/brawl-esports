import { helpTemplate } from "./template";

export async function helpSearchEmbed() {
    const searchEmbed = helpTemplate();
    searchEmbed.addFields([
        {
            name: "Working",
            value: "Search up anything! Brawlers, Maps, eSports Teams, eSports players, eSports Matches. Brawler and map information taken from brawlify and eSports information taken from liquipedia.",
        },
        {
            name: "Commands",
            value: "1. **Type**: Type of the query - be it Brawler, Map, Match, etc.\n2. **Query**: The search query - such as 'Jacky' or 'Temple ruins' or 'SiteTampo'. It does not matter if anything is in capital letters or not, it will search it up regardless.",
        },
    ]);
    return searchEmbed;
}
