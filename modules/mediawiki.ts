export async function findPageName(query: string): Promise<string> {
    const params = new URLSearchParams({
        action: "opensearch",
        format: "json",
        search: query,
    }).toString();
    const fetching = await fetch(
        `https://liquipedia.net/brawlstars/api.php?${params}`,
    )
        .then((response) => response.json())
        .then((data) => {
            return data[3][0];
        });
    const answer = fetching.split("/")[4];
    console.log(answer);
    if (answer == "Navi") {
        return "Natus_Vincere";
    } else {
        return answer;
    }
}
export async function findPrintableName(query: string): Promise<string> {
    if (!query.length) {
        return "NO TEAM"; // this is really just used in /search team
    }
    const params = new URLSearchParams({
        action: "opensearch",
        format: "json",
        search: query,
    }).toString();
    const search = await fetch(
        `https://liquipedia.net/brawlstars/api.php?${params}`,
    )
        .then((response) => {
            if (response.status != 200) {
                return [["hi this is useless shit"], ["-1"]];
            } else {
                return response.json();
            }
        })
        .then((data) => {
            return data;
        });
    return search[1][0];
}
