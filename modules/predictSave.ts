import type { Prediction } from "./moduleTypes.ts";
import { readFile, writeFile } from "node:fs/promises";
export async function savePredictionToDatabase(
    prediction: Prediction,
): Promise<void> {
    const data = JSON.parse(await readFile("db/prediction.json", "utf-8"));
    data[prediction.predictionNumber] = prediction;
    writeFile("db/prediction.json", JSON.stringify(data, null, "    "));
}
