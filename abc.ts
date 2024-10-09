const headers = {
    Authorization: `Apikey ${process.env.LIQUID_TOKEN}`,
};
const params = new URLSearchParams({
    wiki: "brawlstars",
    conditions:
        "[[pagename::Brawl_Stars_Championship/2024/Last_Chance_Qualifier]]",
}).toString();
const data = await fetch(
    `https://api.liquipedia.net/api/v3/standingsentry?${params}`,
    { headers },
).then((response) => response.json());
console.log(JSON.stringify(data, null, "    "));
