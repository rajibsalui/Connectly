
import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";
dotenv.config();


const client = new HfInference(process.env.HUGGINGFACE_API_KEY);

const message = "@AI write a proposal to my wife for a romantic dinner date";

async function getChatCompletion() {
    try {
        const chatCompletion = await client.chatCompletion({
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
		return chatCompletion.choices[0].message;
    } catch (error) {
        console.error('Error:', error.message);
    }
}

//getChatCompletion();

export default getChatCompletion;