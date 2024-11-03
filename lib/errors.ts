export class NotFoundError extends Error {
    constructor(message: string) {
        super(
            `Query '${message}' not found.`
        );
        this.name = this.constructor.name;
    }
}

// Brawlify API errors
export class BrawlerNotFoundError extends NotFoundError {
    public constructor(query: string) {
        super(query);
        this.name = "BrawlerNotFoundError";
    }
}

export class MapNotFoundError extends NotFoundError {
    constructor(query: string) {
        super(query);
        this.name = "MapNotFoundError";
    }
}
export class GameModeNotFoundError extends NotFoundError {
    constructor(query: string) {
        super(query);
        this.name = "GameModeNotFoundError";
    }
}

// LiquipediaDB API Errors
export class PlayerNotFoundError extends NotFoundError {
    constructor(query: string) {
        super(query);
        this.name = "PlayerNotFoundError";
    }
}

export class TeamNotFoundError extends NotFoundError {
    constructor(query: string) {
        super(query);
        this.name = "TeamNotFoundError";
    }
}

export class MatchNotFoundError extends NotFoundError {
    constructor(query: string) {
        super(query);
        this.name = "MatchNotFoundError";
    }
}

export class GroupNotFoundError extends NotFoundError {
    constructor(query: string) {
        super(query);
        this.name = "GroupNotFoundError";
    }
}

export class TeamMemberNotFoundError extends NotFoundError {
    constructor(query: string) {
        super(query);
        this.name = "TeamMemberNotFoundError";
    }
}

// Liquipedia MediaWiki Errors

export class SearchNotFoundError extends NotFoundError {
    constructor(query: string) {
        super(query);
        this.name = "SearchNotFoundError";
    }
}
