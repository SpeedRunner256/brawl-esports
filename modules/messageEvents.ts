import { MessageMatch } from "./moduleTypes";

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

    p(type: "start" | "end" | "game" | "set", query: string) {
        const a = query.split("/").length;
        switch (type) {
            case "start":
                return a == 6;
            case "end":
                return a == 2;
            case "game":
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
        // start/id/team1/team2/sets/games
        this.Add({
            ID,
            sets,
            games,
            teams: [team1, team2],
            setScore: [0, 0],
            gameScore: [0, 0],
        });
        return `# Match start: ${team1} vs ${team2}!\n## ${sets} sets, ${games} games`;
    }
    match(query: string) {
        const a = query.split(this.sep);
        const id = a[1];
        // end/id
        const match = this.Get(id);
        if (!match) {
            return "This is not a match.";
        }
        const winner =
            match.setScore[0] > match.setScore[1]
                ? match.teams[0]
                : match.teams[1];
        this.Remove(id);
        return `# Game, Set, Match!\n ## ${winner} won ${match.setScore[0]}-${match.setScore[1]}`;
    }

    game(query: string) {
        const a = query.split(this.sep);
        const id = a[1];
        const win = a[2];
        // game/id/team
        this.Game(id, win);
        return `# Game! ${win} wins.`;
    }

    set(query: string) {
        const a = query.split(this.sep);
        const id = a[1];
        const win = a[2];
        // set/id/team
        this.Set(id, win);
        return `# Game, Set! ${win} wins.`;
    }
    private Add(obj: MessageMatch) {
        console.log("Added")
        DB.push(obj);
    }

    private Remove(ID: string) {
        for (const obj in DB) {
            if (DB[obj].ID == ID) {
                delete DB[obj];
            }
        }
    }

    private Get(ID: string) {
        console.log(DB);
        for (const obj in DB) {
            if (DB[obj].ID === ID) {
                return DB[obj];
            }
        }
    }
    private Game(ID: string, team: string) {
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
            if (a.gameScore[0] >= a.games) {
                a.gameScore[0] = 0;
                a.setScore[0] += 1;
            }
        } else {
            a.gameScore[1] += 1;
            if (a.gameScore[1] >= a.games) {
                a.gameScore[1] = 0;
                a.setScore[1] += 1;
            }
        }
    }

    private Set(ID: string, team: string) {
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
            a.setScore[0] += 1;
        } else {
            a.setScore[1] += 1;
        }
    }
}
