import { executeModelChain } from './src/model-router/orchestrator.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function runTest() {
  console.log('--- PHASE 1: SYMPTOM ANALYSIS ---');
  try {
    const symptomResponse = await executeModelChain('SYMPTOMS', 'Headache and nausea', 'Respond with JSON ONLY. No markdown.');
    console.log('Symptom Response Received:\n', symptomResponse);
  } catch (e) {
    console.error('Symptom Test Failed:', e.message);
  }

  console.log('\n--- PHASE 2: MEDICINE COMPATIBILITY ---');
  try {
    const medicineResponse = await executeModelChain('MEDICINE_EXPLANATION', 'Aspirin and Warfarin', 'Respond with JSON ONLY. No markdown.');
    console.log('Medicine Response Received:', medicineResponse.substring(0, 100), '...');
  } catch (e) {
    console.error('Medicine Test Failed:', e.message);
  }

  console.log('\n--- PHASE 3: AI DOCTOR CHAT ---');
  try {
    const chatResponse = await executeModelChain('AI_DOCTOR', 'Hello, I feel dizzy', 'You are a helpful assistant. No markdown.');
    console.log('Chat Response Received:', chatResponse.substring(0, 100), '...');
  } catch (e) {
    console.error('Chat Test Failed:', e.message);
  }
}

runTest();
