import { helpTemplate } from "./template";

export async function helpPredictEmbed() {
    const predictEmbed = helpTemplate();
    predictEmbed.addFields({
        name: "Work in progress",
        value: "This feature may or may not currently be in work.",
    });
    // predictEmbed.description += "Predict";
    // predictEmbed.fields[0].value +=
    //     "A **currency-run** event that users can bet on. Given the relatively intuitive parameters, its easy to create a twitch-like prediction with more than just 2 options this time.";
    // predictEmbed.fields[1].value +=
    //     '1. **Title**: Pretty self explanatory, the title of the prediction.\n2. **Choices**: The choices the the prediction will have. Example of a valid choice field would be "No more half measures;Did you know you have rights?;The constitution says you do!;And I do too.\n3. **Duration**: The duration - best explained with an example *"1d5h12m15s"* = 1 day 5 hours 12 minutes and 15 seconds. In general - _d_ for days, _h_ for hours, _m_ for minutes, _s_ for seconds';
    return predictEmbed;
}
