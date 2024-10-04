import { helpTemplate } from "./template";

export async function helpInlineEmbed() {
    const inlineEmbed = helpTemplate();
    inlineEmbed.setDescription(
        "This is not a command, and only available for moderators or esports 'hosts'.This is just searching for stuff 'in between messages'."
    );
    inlineEmbed.addFields([
        {
            name: "Working",
            value: "This is just _/search_ in 'disguise' - in the sense that this just enables you to search any query as a regular message and the bot will search it up for you. To use it, just type your search queries in **double brackets** ``[[query]]`` with a 'prefix'. Best understood with an example - [[B.Jacky]] -where B is the prefix for brawler. This generates a brawler embed.  Other prefixes are\n**B**: Brawler\n**M**: Map\n**T**: Team\n**P**: Player\n **NOTE**: Match inline does not exist.",
        },
    ]);
    return inlineEmbed;
}
