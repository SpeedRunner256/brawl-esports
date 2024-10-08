import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Colors, ComponentType } from "discord.js";
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { stringUtils } from "../../utilities/stringUtils";
import { Economy } from "../../modules/economy/economy";

export const data = new SlashCommandBuilder()
    .setName("raffle")
    .setDescription("Start a raffle for a given amount of points.")
    .addIntegerOption((option) =>
        option
            .setName("points")
            .setDescription("Points to give out")
            .setMinValue(100)
            .setMaxValue(50_000)
            .setRequired(true),
    )
    .addStringOption((option) =>
        option
            .setName("time")
            .setDescription("Time of the raffle")
            .setRequired(true),
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const points = interaction.options.getInteger("points");
    const t = interaction.options.getString("time")?.trim();
    if (!points || !t) {
        throw new Error("Points not found.");
    }
    const time = stringUtils.duration(t);
    // Embed
    const embed = new EmbedBuilder()
        .setTitle("Raffle!")
        .setDescription(
            points + " points for everyone! This raffle ends in " + t,
        )
        .setColor(Colors.DarkNavy);

    // Button
    const button = new ButtonBuilder()
        .setCustomId("count-me-in")
        .setEmoji("🎉")
        .setStyle(ButtonStyle.Primary)
        .setLabel("Count me in!");
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
    const reply = await interaction.reply({
        embeds: [embed],
        components: [row],
    });
    const collector = reply.createMessageComponentCollector({
        time,
        componentType: ComponentType.Button,
    });
    const people: string[] = [];
    collector.on("collect", async (i) => {
        // if user not yet in db
        console.log(i.user.id);
        if (!(await Economy.userExist(i.user.id))) {
            await i.reply({
                content:
                    "You are not in the database. Consider pressing /start",
                ephemeral: true,
            });
            return;
        }
        // if user already in
        if (people.includes(i.user.id)) {
            await i.reply({
                content: "You are already in, no need to enter again.",
                ephemeral: true,
            });
            return;
        }
        // put them in the raffle
        people.push(i.user.id);
        await i.reply({
            content:
                "You have been enrolled in this raffle. Please wait for the raffle to end.",
            ephemeral: true,
        });
    });
    collector.on("end", async () => {
        // turn off buttons
        row.components[0].setDisabled(true);
        await interaction.editReply({
            components: [row],
        });
        // Throw in rewards.
        const rewardedUsers = rewards(people);
        const reward = points / rewardedUsers.length;
        for (const user of rewardedUsers) {
            const eco = await Economy.UserByID(user);
            console.log("crediting...");
            eco?.credit(reward);
        }
        // Put the embed on.
        const users = await getUsersFromIds(rewardedUsers, interaction);
        const amountCredited = () => {
            let answer = "";
            for (const user of users) {
                answer += `${user.displayName}: ${reward}\n`;
            }
            return answer;
        };
        // Make embed
        const embed = new EmbedBuilder()
            .setTitle("Raffle end!")
            .setColor(Colors.Navy)
            .setDescription("The raffle that started " + t + " ago has ended.")
            .addFields([
                {
                    name: "Winners",
                    value: `${rewardedUsers.length}`,
                },
                {
                    name: "Amount credited",
                    value: `\u200b${amountCredited()}`,
                },
            ]);
        await interaction.followUp({
            embeds: [embed],
        });
    });
}

// Throw in rewards
function rewards(people: string[]): string[] {
    const answer: string[] = [];
    if (people.length == 1) {
        return people;
    }
    for (const user of people) {
        if (Math.random() > 0.31415) {
            answer.push(user);
        }
    }
    return answer;
}
// Fetch users from Discord
async function getUsersFromIds(
    userIds: string[],
    interaction: ChatInputCommandInteraction,
) {
    const users = [];
    for (const userId of userIds) {
        const user = await interaction.client.users
            .fetch(userId)
            .catch((err: typeof Error) => {
                console.error(`Error fetching user ${userId}: ${err}`);
                return null;
            });
        if (user) {
            users.push(user);
        }
    }
    return users;
}
