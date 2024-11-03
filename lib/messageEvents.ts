import { MessageMatch } from "./moduleTypes.ts";

const DB: MessageMatch[] = [];
export class BracketClass {
    sep = "/";
    matches: string[] | undefined;
    constructor(content: string) {
        const regex = /\[(.*?)\]/g;
        const queries = content
            .match(regex)
            ?.map((match) => match.replace(/\[|\]/g, ""));
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
        const m = this.Get(id);
        if (!m) {
            return "Invalid message format.";
        }
        const gameScore = Array.from(m.gameScore);
        const setScore = Array.from(m.setScore);
        this.Work(m);
        if (m.setScore[0] == m.sets) {
            return `# Game, Set, Match!\n## ${m.teams[0]} wins this match - ${m.setScore[0]}:${m.setScore[1]}`;
        } else if (m.setScore[1] == m.sets) {
            return `# Game, Set, Match!\n## ${m.teams[1]} wins this match - ${m.setScore[0]}:${m.setScore[1]}`;
        } else if (gameScore[0] >= m.games) {
            return `# Game & Set!\n## ${m.teams[0]} wins - ${gameScore[0]}:${gameScore[1]}\n### Sets - ${setScore[0]}:${setScore[1]}`;
        } else if (gameScore[1] >= m.games) {
            return `# Game & Set!\n## ${m.teams[1]} wins - ${gameScore[0]}:${gameScore[1]}\n### Sets - ${setScore[0]}:${setScore[1]}`;
        } else {
            return `# Game!\n## ${win} wins - ${gameScore[0]} - ${gameScore[1]}\n### Sets - ${setScore[0]}:${setScore[1]}`;
        }
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
