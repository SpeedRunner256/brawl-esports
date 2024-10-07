export type Match = {
    pagename: string;
    objectname: string;
    winner: number;
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
    scores: [number, number];
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
    links: object;
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
export type User = {
    username: string;
    userID: string;
    balance: number;
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
