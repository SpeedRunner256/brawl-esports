type ExtraData = {
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
export function getBanList(data: ExtraData): string {
    const team1Bans = Object.values(data.bans.team1);
    const team2Bans = Object.values(data.bans.team2);
    const uniqueBans = [...new Set([...team2Bans, ...team1Bans])];
    return uniqueBans.join(", ");
}
