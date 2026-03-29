import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Profile from './src/models/Profile.js';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const profiles = await Profile.find();
        console.log('--- SOS_PROFILE_AUDIT ---');
        profiles.forEach(p => {
            console.log(`User: ${p.user}, Contact Email: ${p.emergencyContact?.email}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
