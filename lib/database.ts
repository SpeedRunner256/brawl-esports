import { readFile, writeFile } from "fs/promises";
import { Match, Player, Team } from "./types.ts";

type Type = "match" | "player" | "team";
export class Database {
	private filePath: string;
	get(type: Type, filePath: string) {
		this.filePath = filePath;
		switch (type) {
			case "match":
				if (!this.filePath) {
					break;
				}
				break;
			case "player":
				break;
			case "team":
				break;
		}
	}
	/**
	 *  Push a Player object into the database if not already present
	 * @param playerObject - Player object to send
	 * @returns void
	 */
	async pushPlayer(playerObject: Player): Promise<void> {
		const data = JSON.parse(await readFile("db/players.json", "utf-8")) as Player[];
		let existsInDb = false;
		for (const player of data) {
			if (player.id === playerObject.id) {
				existsInDb = true;
				break;
			}
		}
		if (!existsInDb) {
			data.push(playerObject);
			writeFile("db/players.json", JSON.stringify(data, null, "    "));
		}
	}
	/**
	 * Get Player[] from database given a few optional parameters - all case insensitive.
	 * @param id - Id of the player
	 * @param nationality - Nationality of the player
	 * @param pagename - Name of page
	 * @returns Promise<Player[]>
	 */
	async getPlayer(Id: string | null = null, Nationality: string | null = null, Pagename: string | null = null): Promise<Player[]> {
		const playerArray: Player[] = [];
		const data = JSON.parse(await readFile("db/players.json", "utf-8")) as Player[];
		for (const player of data) {
			const { id, nationality, pagename } = player;
			if (Id && id == Id.toLowerCase()) {
				playerArray.push(player);
			}
			if (Nationality && Nationality == nationality.toLowerCase()) {
				playerArray.push(player);
			}
			if (Pagename && Pagename == pagename.toLowerCase()) {
				playerArray.push(player);
			}
		}
		return playerArray;
	}
	/**
	 * Push a Team object into database if it does not exist yet.
	 * @param teamObject - the Team object in question
	 * @returns void
	 */
	async pushTeam(teamObject: Team) {
		const data = JSON.parse(await readFile("db/teams.json", "utf8")) as Team[];
		let existsInDB = false;
		for (const team of data) {
			if (team.name == teamObject.name) {
				existsInDB = true;
				break;
			}
		}
		if (!existsInDB) {
			data.push(teamObject);
			writeFile("db/teams.json", JSON.stringify(data, null, "    "));
		}
	}
	/**
	 * Given a few optional parameters, returns the search results.
	 * @param name Name of the Team
	 * @param pagename pagename of Team
	 * @return Promise<Team[]>
	 */
	async getTeam(teamName: string | null = null, pageName: string | null = null): Promise<Team[]> {
		const data = JSON.parse(await readFile("db/teams.json", "utf8")) as Team[];
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
	async pushMatch(matchObject: Match[]) {
		const data = JSON.parse(await readFile("db/matches.json", "utf8")) as Match[];
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
			writeFile("db/matches.json", JSON.stringify(data, null, "    "));
		}
	}
	async getMatch(pageName: string | null = null, tickerName: string | null = null, objectName: string | null = null) {
		const data = JSON.parse(await readFile("db/matches.json", "utf8")) as Match[];
		const answer: Match[] = [];
		for (const match of data) {
			const { pagename, tickername, objectname } = match;
			if (pageName && pagename.toLowerCase() == pageName?.toLowerCase()) {
				answer.push(match);
			}
			if (tickerName && tickername.toLowerCase() == tickerName?.toLowerCase()) {
				answer.push(match);
			}
			if (objectName && objectname.toLowerCase() == objectName?.toLowerCase()) {
				answer.push(match);
			}
		}
		return answer;
	}
}
