export type Match = {
	pagename: string;
	objectname: string;
	winner: string;
	finished: boolean;
	stream: object;
	tickername: string;
	icondarkurl: string;
	tiertype: string;
	match2opponents: Match2Opponents[];
	match2games: Match2Games[];
};
export type Match2Opponents = {
	id: number;
	name: string;
	score: number;
	placement: number;
	match2players: Match2Players[];
};
export type Match2Games = {
	map: string;
	scores: number[];
	participants: {
		"1_1": { brawler: string };
		"1_2": { brawler: string };
		"1_3": { brawler: string };
		"2_1": { brawler: string };
		"2_2": { brawler: string };
		"2_3": { brawler: string };
	};
	winner: number;
	date: string;
	resulttype: string;
	extradata: {
		bans: {
			team1: {
				1: string;
				2: string;
				3: string;
			};
			team2: {
				1: string;
				2: string;
				3: string;
			};
		};
		firstpick: number;
		maptype: string;
		bestof: string;
	};
};
export type Match2Players = {
	id: number;
	displayname: string;
	country: string;
};
export type Player = {
	pagename: string;
	id: string;
	nationality: string;
	region: string;
	teampagename: string;
	twitter: string;
	status: string;
	earnings: string;
};
export type SquadPlayer = {
	id: string;
	type: string;
	role: string;
	link: string;
	status: string;
	joindate: string;
	nationality: string;
};
export type Team = {
	pagename: string;
	name: string;
	region: string;
	logodarkurl: string;
	textlesslogodarkurl: string;
	status: string;
	createdate: string;
	disbanddate: string;
	links: object;
	players: SquadPlayer[];
};
export type Brawler = {
	id: number;
	name: string;
	description: string;
	link: string;
	imageUrl: string;
	class: string;
	rarity: {
		name: string;
		color: string;
	};
	starPowers: [
		{
			name: string;
			description: string;
		},
		{
			name: string;
			description: string;
		}
	];
	gadgets: [
		{
			name: string;
			description: string;
		},
		{
			name: string;
			description: string;
		}
	];
};
export type Map = {
	id: number;
	name: string;
	link: string;
	imageUrl: string;
	gamemode: {
		name: string;
		color: string;
		link: string;
		imageUrl: string;
	};
};
export type GameMode = {
	name: string;
	title: string;
	color: string;
	description: string;
	shortDescription: string;
	link: string;
	imageUrl: string;
};
export type User = {
	username: string;
	userID: string;
	balance: number;
	lastGambleTime: number;
};
export type Prediction = {
	guildId: string | null;
	question: string;
	choice1: string;
	choice2: string;
	predictionNumber: number;
	time: string;
	userChoices: { 1: string[]; 2: string[] };
	answer?: { hasAnswer: boolean; answer: number };
};
export type PredictionChoice = {
	userID: string;
	choice: number;
};
export type Groups = {
	pagename: string;
	standingsindex: number;
	opponentname: string;
	placement: string;
	scoreboard: {
		overtime: {
			d: string;
			w: string;
			l: number;
		};
		points: number;
		diff: number;
		game: {
			d: number;
			w: number;
			l: number;
		};
		match: {
			d: number;
			w: number;
			l: number;
		};
	};
};
export type ExtraData = {
	bans: {
		team1: {
			1: string;
			2: string;
			3: string;
		};
		team2: {
			1: string;
			2: string;
			3: string;
		};
	};
	firstpick: number;
	maptype: string;
	bestof: string;
};
export type Pun = {
	names: string[];
	random_quotes: string[];
	id: string;
	embed: {
		title: string;
		color: number;
		description: string;
		thumbnail?: {
			url: string;
		};
		footer?: {
			text?: string;
			icon_url?: string;
		};
	};
};
export type PunData = {
	allow: string[];
	links: string[];
	puns: Pun[];
};
export type MessageMatch = {
	ID: string;
	teams: [string, string];
	setScore: [number, number];
	gameScore: [number, number];
	winner?: string;
	sets: number;
	games: number;
};
export interface gamePlayer {
	tag: string;
	name: string;
	nameColor: string;
	icon: Icon;
	image: string;
	trophies: number;
	highestTrophies: number;
	expLevel: number;
	expPoints: number;
	isQualifiedFromChampionshipChallenge: boolean;
	"3vs3Victories": number;
	soloVictories: number;
	duoVictories: number;
	bestRoboRumbleTime: number;
	bestTimeAsBigBrawler: number;
	club: ClubName;
	brawlers: gameBrawler[];
}

interface gameBrawler {
	id: number;
	name: string;
	power: number;
	rank: number;
	trophies: number;
	highestTrophies: number;
	gears: Gear[];
	starPowers: StarPower[];
	gadgets: StarPower[];
}

interface StarPower {
	id: number;
	name: string;
}

interface Gear {
	id: number;
	name: string;
	level: number;
}

interface ClubName {
	tag: string;
	name: string;
}

interface Icon {
	id: number;
}

export interface BattleLog {
	items: Item[];
}

interface Item {
	battleTime: string;
	event: Event;
	battle: Battle;
}

interface Battle {
	mode: string;
	type: string;
	result?: string;
	duration?: number;
	starPlayer?: StarPlayer;
	teams?: StarPlayer[][];
	trophyChange?: number;
	rank?: number;
	players?: StarPlayer[];
}

interface StarPlayer {
	tag: string;
	name: string;
	brawler: gameBrawler;
}

interface gameBrawler {
	id: number;
	name: string;
	power: number;
	trophies: number;
}

interface Event {
	id: number;
	mode: string;
	map: string;
}
export interface Club {
	tag: string;
	name: string;
	description: string;
	type: string;
	badgeId: number;
	requiredTrophies: number;
	trophies: number;
	members: Member[];
}

interface Member {
	tag: string;
	name: string;
	nameColor: string;
	role: string;
	trophies: number;
	icon: Icon;
}

interface Icon {
	id: number;
}
