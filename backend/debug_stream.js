import { callGroqStream } from './src/ai-services/groqService.js';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
    console.log('Starting Groq Stream Test (ESM)...');
    try {
        await callGroqStream('Hello', 'You are an assistant', 'qwen/qwen3-32b', (chunk) => {
            if (chunk) process.stdout.write(chunk);
            else console.log('\n[Stream End]');
        });
        console.log('Test Complete');
    } catch (e) {
        console.error('\n[Test Error]:', e.message);
        console.error(e.stack);
    }
};

test();
