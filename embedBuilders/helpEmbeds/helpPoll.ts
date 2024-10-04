import { helpTemplate } from "./template";

export async function helpPollEmbed() {
    const pollEmbed = helpTemplate();
    pollEmbed.addFields({
        name: "Working",
        value: "Just an 'easier' way to make in-built discord polls. Just add in the required fields and the bot will produce an discord poll. Why? Copy-pastable polls.",
    });
    pollEmbed.addFields({
        name: "Commands",
        value: "1. **Question**: The question of the poll. Straightforward.\n2. **Answers**: Answers of the poll, separated by \\.. For instance, 'Pain is weakness leaving the body \\ To W.W. My star, my perfect silence \\ Woodrow Wilson? Willy Wonka? Walter White?'\n3. **Time**: If you're used zeppelin before, you know this. '1d2h5m4s' translates to 1 day 2 hours 5 minutes and 4 seconds.",
    });
    return pollEmbed;
}
