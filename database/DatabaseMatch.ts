import type { Match } from "../modules/moduleTypes";
import { readFile, writeFile } from "fs/promises";

export class DatabaseMatch {
    private filePath = "db/matches.json";
    constructor(filePath?: string) {
        if (filePath) {
            this.filePath = filePath;
        }
    }

    async pushMatch(matchObject: Match[]) {
        const data = JSON.parse(
            await readFile(this.filePath, "utf8"),
        ) as Match[];
        let existInDb = false;
        for (const match1 of matchObject) {
            for (const match2 of data) {
                if (match1.pagename == match2.pagename) {
                    existInDb = true;
                    break;
                }
            }
        }
        if (!existInDb) {
            for (const match of matchObject) {
                data.push(match);
            }
            writeFile(this.filePath, JSON.stringify(data, null, "    "));
        }
    }

    async getMatch(
        pageName: string | null = null,
        tickerName: string | null = null,
        objectName: string | null = null,
    ) {
        const data = JSON.parse(
            await readFile(this.filePath, "utf8"),
        ) as Match[];
        const answer: Match[] = [];
        for (const match of data) {
            const { pagename, tickername, objectname } = match;
            if (pageName && pagename.toLowerCase() == pageName?.toLowerCase()) {
                answer.push(match);
            }
            if (
                tickerName &&
                tickername.toLowerCase() == tickerName?.toLowerCase()
            ) {
                answer.push(match);
            }
            if (
                objectName &&
                objectname.toLowerCase() == objectName?.toLowerCase()
            ) {
                answer.push(match);
            }
        }
        return answer;
    }
}
