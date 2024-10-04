import { helpTemplate } from "./template";

export async function helpMatchEmebd() {
    const matchEmbed = helpTemplate();
    matchEmbed.setDescription(
        "This is a subcommand used ONLY by moderators+ or esports organizers. Look at the working for more information."
    );
    matchEmbed.addFields({
        name: "Working",
        value: "Kind of a heartbreak considering how good of a feature this is and how bad this is to use. Liquipedia doesn't like making discord bots idk : (\n Anyway, this all you have to do is open liquipedia's website, search for the current event happening, then paste the link in - though not the entire thing - just everything after 'brawlstars/' - like for LCQ 2024 the link would be [this](https://liquipedia.net/brawlstars/Brawl_Stars_Championship/2024/Last_Chance_Qualifier) and you have to copy it and paste just 'Brawl_Stars_Championship/2024/Last_Chance_Qualifier' in. Slightly tedious.",
    });
    return matchEmbed;
}
