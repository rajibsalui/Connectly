 import { HfInference } from "@huggingface/inference";
 import dotenv from "dotenv";
 dotenv.config();
 console.log(process.env.HUGGINGFACE_API_KEY);

const client = new HfInference(process.env.HUGGINGFACE_API_KEY);

 const message = "@ai write a proposal to my girlfriend for a romantic dinner date"
const chatCompletion = await client.chatCompletion({ 
	//model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    model: "mistralai/Mistral-7B-Instruct-v0.3",
	
	messages: [
		{
			role: "user",
			prompt: "You are a helpful assistant. Your task is to write chats according to the given prompts.",
			content: message.replace('@ai'||'@AI', '').trim(),
		}
	],
	provider: "hf-inference",
	max_tokens: 500,
});

console.log(chatCompletion.choices[0].message);