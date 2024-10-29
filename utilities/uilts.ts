import { readFile } from "fs/promises";
import { ExtraData, Pun, PunData } from "../modules/moduleTypes";

export function getBanList(data: ExtraData): string {
    const team1Bans = Object.values(data.bans.team1);
    const team2Bans = Object.values(data.bans.team2);
    const uniqueBans = [...new Set([...team2Bans, ...team1Bans])];
    return uniqueBans.join(", ");
}
export async function checkAllow(uid: string) {
    const file: PunData = JSON.parse(await readFile("db/puns.json", "utf-8"));
    for (const id of file.allow) {
        if (id == uid) {
            return true;
        }
    }
    return false;
}
export async function checkPun(pname: string) {
    const file: PunData = JSON.parse(await readFile("db/puns.json", "utf-8"));
    for (const pun of file.puns) {
        for (const name of pun.names) {
            if (name == pname) {
                return pun;
            }
        }
    }
    throw new Error(`No pun found - trying ${pname}`);
}
