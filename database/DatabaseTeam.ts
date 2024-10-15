import type { Team } from "../modules/moduleTypes.ts";
import { readFile, writeFile } from "node:fs/promises";

export class DatabaseTeam {
    private filePath = "db/teams.json";
    constructor(filePath?: string) {
        if (filePath) {
            this.filePath = filePath;
        }
    }
    /**
     * Push a Team object into database if it does not exist yet.
     * @param teamObject - the Team object in question
     * @returns void
     */
    async pushTeam(teamObject: Team) {
        const data = JSON.parse(
            await readFile(this.filePath, "utf8"),
        ) as Team[];
        let existsInDB = false;
        for (const team of data) {
            if (team.name == teamObject.name) {
                existsInDB = true;
                break;
            }
        }
        if (!existsInDB) {
            data.push(teamObject);
            writeFile(this.filePath, JSON.stringify(data, null, "    "));
        }
    }

    /**
     * Given a few optional parameters, returns the search results.
     * @param name Name of the Team
     * @param pagename pagename of Team
     * @return Promise<Team[]>
     */
    async getTeam(
        teamName: string | null = null,
        pageName: string | null = null,
    ): Promise<Team[]> {
        const data = JSON.parse(
            await readFile(this.filePath, "utf8"),
        ) as Team[];
        const answer: Team[] = [];
        for (const team of data) {
            const { pagename, name } = team;
            if (pageName && pagename.toLowerCase() == pageName.toLowerCase()) {
                answer.push(team);
            }
            if (teamName && name.toLowerCase() == teamName.toLowerCase()) {
                answer.push(team);
            }
        }
        return answer;
    }
}
