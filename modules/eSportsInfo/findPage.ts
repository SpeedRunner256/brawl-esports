import jsdom from "jsdom";
const { JSDOM } = jsdom;
export async function findPageName(query: string): Promise<string> {
    const search = await fetch(
        `https://liquipedia.net/brawlstars/api.php?action=opensearch&format=json&search=${query}`
    )
        .then((response) => response.json())
        .then((data) => {
            return data[3][0];
        });
    const answer = search.split("/")[4];
    if (answer == "Navi") {
        return "Natus_Vincere";
    } else {
        return answer;
    }
}
export async function findPrintableName(query: string): Promise<string> {
    if (!query.length) {
        return "No data";
    }
    const search = await fetch(
        `https://liquipedia.net/brawlstars/api.php?action=opensearch&format=json&search=${query}`
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
export async function findPlayerImage(query: string): Promise<string> {
    const link = await fetch(
        `https://liquipedia.net/brawlstars/api.php?action=opensearch&format=json&search=${query}`
    )
        .then((response) => response.json())
        .then((data) => {
            return data[3][0];
        });
    const html: string = await fetch(link).then((response) => response.text());
    const dom = new JSDOM(html);
    const meta = dom.window.document.querySelectorAll("meta");
    let imageLink: string = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta.forEach((element: any) => {
        if (element.name == "twitter:image:src") {
            imageLink = element.getAttribute("content");
        }
    });
    if (imageLink == "") {
        return "https://png.pngtree.com/png-vector/20210827/ourmid/pngtree-error-404-page-not-found-png-image_3832696.jpg";
    } else {
        return imageLink;
    }
}
