import { Config } from "../config";
import { type User } from "../moduleTypes";
import { readFile, writeFile } from "fs/promises";
export class Economy {
    private currentUser: User;
    constructor(user: User) {
        this.currentUser = user;
    }
    static async userExist(ID: string): Promise<boolean> {
        const data = JSON.parse(await readFile("db/economy.json", "utf8"));
        for (const user of Object.keys(data)) {
            if (user == ID) {
                return true;
            }
        }
        return false;
    }
    static async UserByID(ID: string): Promise<Economy | null> {
        const data = JSON.parse(await readFile("db/economy.json", "utf8"));
        for (const user of Object.keys(data)) {
            if (user == ID) {
                return new Economy(data[ID]);
            }
        }
        return null;
    }
    static async initUser(
        username: string,
        userID: string,
        guildID: string,
    ): Promise<Economy> {
        const balance = await Config.balance(guildID);
        const newUser: User = { username, userID, balance, lastGambleTime: 0 };
        const data = JSON.parse(await readFile("db/economy.json", "utf-8"));
        data[userID] = newUser;
        writeFile("db/economy.json", JSON.stringify(data, null, "    "));
        return new Economy(newUser);
    }
    private async Update(userObj: User) {
        const ID = this.userID;
        const data = JSON.parse(await readFile("db/economy.json", "utf8"));
        for (const user of Object.keys(data)) {
            if (user === ID) {
                const currentUser = data[ID];
                currentUser.balance = Math.floor(userObj.balance);
                currentUser.lastGambleTime = userObj.lastGambleTime;
                data[ID] = currentUser;
                writeFile(
                    "db/economy.json",
                    JSON.stringify(data, null, "    "),
                );
                return;
            }
        }
        throw new Error("User not found.");
    }
    get username() {
        return this.currentUser.username;
    }
    get userID() {
        return this.currentUser.userID;
    }
    get balance() {
        return this.currentUser.balance;
    }
    get lastGambleTime() {
        return this.currentUser.lastGambleTime;
    }
    time(time: number) {
        this.currentUser.lastGambleTime = time;
        this.Update(this.currentUser);
    }
    credit(credit: number) {
        this.currentUser.balance += credit;
        this.Update(this.currentUser);
    }
    debit(debit: number) {
        this.currentUser.balance -= debit;
        this.Update(this.currentUser);
    }
}
