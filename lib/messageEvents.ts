import { MyEmbeds } from "./embeds.ts";
import { findPageName } from "./mediawiki.ts";
import { MessageMatch } from "./types.ts";

const DB: MessageMatch[] = [];
const e = new MyEmbeds();
export class BracketClass {
	sep = "/";
	matches: string[] | undefined;
	constructor(content: string) {
		const regex = /\[(.*?)\]/g;
		const queries = content.match(regex)?.map((match) => match.replace(/\[|\]/g, ""));
		this.matches = queries;
	}

	p(type: "start" | "end" | "win" | "set", query: string) {
		const a = query.split("/").length;
		switch (type) {
			case "start":
				return a == 6;
			case "end":
				return a == 2;
			case "win":
				return a == 3;
			case "set":
				return a == 3;
		}
	}
	start(query: string) {
		const a = query.split(this.sep);
		const ID = a[1];
		const match = this.Get(ID);
		if (match) {
			return "Match ID already exists - use a different ID.";
		}
		const team1 = a[2];
		const team2 = a[3];
		const sets = +a[4];
		const games = +a[5];
		if (isNaN(sets) || isNaN(games)) {
			throw new Error("is NAN");
		}
		// start/id/team1/team2/sets/games
		this.Add({
			ID,
			sets,
			games,
			teams: [team1, team2],
			setScore: [0, 0],
			gameScore: [0, 0],
		});
		return `# Match start: ${team1} vs ${team2}!\n## First to ${sets} sets and ${games} games`;
	}
	win(query: string) {
		const a = query.split(this.sep);
		const id = a[1];
		const win = a[2];
		this.Win(id, win);
		// win/id/team
		const currentMatch = this.Get(id);
		if (!currentMatch) {
			return "Invalid message format - ID doesn't exist";
		}
		const gameScore = Array.from(currentMatch.gameScore);
		this.Work(currentMatch);
		if (currentMatch.setScore[0] == currentMatch.sets) {
			return `# Game, Set, Match!\n## ${currentMatch.teams[0]} wins this match - ${currentMatch.setScore[0]}:${currentMatch.setScore[1]}`;
		} else if (currentMatch.setScore[1] == currentMatch.sets) {
			return `# Game, Set, Match!\n## ${currentMatch.teams[1]} wins this match - ${currentMatch.setScore[0]}:${currentMatch.setScore[1]}`;
		} else if (gameScore[0] >= currentMatch.games) {
			return `# Game & Set!\n## ${currentMatch.teams[0]} wins - ${gameScore[0]}:${gameScore[1]}\n### Sets - ${currentMatch.setScore[0]}:${currentMatch.setScore[1]}`;
		} else if (gameScore[1] >= currentMatch.games) {
			return `# Game & Set!\n## ${currentMatch.teams[1]} wins - ${gameScore[0]}:${gameScore[1]}\n### Sets - ${currentMatch.setScore[0]}:${currentMatch.setScore[1]}`;
		} else {
			return `# Game!\n## ${win} wins - ${currentMatch.gameScore[0]} - ${currentMatch.gameScore[1]}\n### Sets - ${currentMatch.setScore[0]}:${currentMatch.setScore[1]}\n${
				currentMatch.gameScore[0] + 1 == currentMatch.games && currentMatch.setScore[0] + 1 == currentMatch.sets
					? `## Match point for ${currentMatch.teams[0]}`
					: currentMatch.gameScore[1] + 1 == currentMatch.games && currentMatch.setScore[1] + 1 == currentMatch.sets
					? `## Match point for ${currentMatch.teams[1]}`
					: ""
			}`;
		}
	}
	async map(query: string) {
		return e.searchMap(await findPageName(query.split("/")[1]));
	}
	async brawler(query: string) {
		return e.searchBrawler(await findPageName(query.split("/")[1]));
	}
	async player(query: string) {
		return e.searchPlayer(await findPageName(query.split("/")[1]));
	}
	async team(query: string) {
		return e.searchTeam(await findPageName(query.split("/")[1]));
	}
	private Add(obj: MessageMatch) {
		DB.push(obj);
	}
	private Get(ID: string) {
		for (const obj in DB) {
			if (DB[obj].ID === ID) {
				return DB[obj];
			}
		}
	}
	private Win(ID: string, team: string) {
		let a: MessageMatch | undefined = undefined;
		for (const obj of DB) {
			if (obj.ID == ID) {
				a = obj;
			}
		}
		if (!a) {
			return;
		}
		if (a.teams[0] == team) {
			a.gameScore[0] += 1;
		} else {
			a.gameScore[1] += 1;
		}
	}
	private Work(match: MessageMatch) {
		if (match.gameScore[0] >= match.games) {
			match.gameScore[0] = 0;
			match.setScore[0] += 1;
		} else if (match.gameScore[1] >= match.games) {
			match.gameScore[1] = 0;
			match.setScore[1] += 1;
		}
	}
}
