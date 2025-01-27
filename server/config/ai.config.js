import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";
dotenv.config();

const client = new HfInference(process.env.HUGGINGFACE_API_KEY);

const chatCompletion = await client.chatCompletion({
	//model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    model: "mistralai/Mistral-7B-Instruct-v0.3",
	messages: [
		{
			role: "user",
			content: "What is the capital of France?"
		}
	],
	provider: "hf-inference",
	max_tokens: 500
});

console.log(chatCompletion.choices[0].message);