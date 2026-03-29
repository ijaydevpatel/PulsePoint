import Mailjet from 'node-mailjet';

/**
 * PulsePoint Zero-Cost Global SOS Dispatch Utility
 * Uses Mailjet Official SDK for high-deliverability clinical SOS packets.
 */
export const sendSOSEmail = async (recipientEmail, payload) => {
    try {
        const hasCredentials = process.env.SYSTEM_EMAIL && process.env.SYSTEM_EMAIL_PASS && process.env.SYSTEM_EMAIL_PASS !== 'mock_pass_override';
        
        if (!hasCredentials) {
            console.log('[MAILJET_MOCK] Simulation Success. Response Payload Dispatched.');
            return true;
        }

        const mailjet = Mailjet.apiConnect(
            process.env.SYSTEM_EMAIL,
            process.env.SYSTEM_EMAIL_PASS
        );

        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${payload.dispatchCoordinates}`;
        
        console.log(`[MAILJET_TRACE] Attempting API Dispatch: From=${process.env.SYSTEM_SENDER_EMAIL}, To=${recipientEmail}`);

    const request = await mailjet
        .post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [{
                "From": {
                    "Email": process.env.SYSTEM_SENDER_EMAIL,
                    "Name": "PulsePoint Emergency"
                },
                "To": [{
                    "Email": recipientEmail,
                    "Name": "Emergency Contact"
                }],
                "Subject": "PulsePoint Clinical SOS: Emergency Medical Alert",
                "HTMLPart": `
                    <div style="font-family: 'Inter', sans-serif; background: #fafafa; color: #111827; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background: #ef4444; padding: 20px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase;">Medical Emergency</h1>
                        </div>
                        
                        <p style="font-size: 16px; line-height: 1.5; color: #374151;">An emergency signal has been received from <strong>PulsePoint Clinical</strong>. Vital biometrics and location are attached below.</p>
                        
                        <div style="background: #ffffff; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #e5e7eb;">
                            <ul style="list-style: none; padding: 0; margin: 0; font-size: 15px;">
                                <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Patient:</strong> ${payload.biometrics.age}y/o ${payload.biometrics.gender}</li>
                                <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Blood:</strong> ${payload.biometrics.bloodGroup}</li>
                                <li style="padding: 8px 0;"><strong>Allergies:</strong> ${payload.anaphylacticHazards?.join(', ') || 'None'}</li>
                            </ul>
                        </div>

                        <div style="background: #fef2f2; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #fee2e2; text-align: center;">
                            <p style="font-size: 18px; font-weight: bold; color: #b91c1c;">GPS: ${payload.dispatchCoordinates}</p>
                            <a href="${mapsLink}" style="display: inline-block; background: #ef4444; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">VIEW LOCATION</a>
                        </div>
                    </div>
                `,
                "CustomID": "PulsePointSOS",
                "TrackClick": "off",
                "TrackOpen": "off",
                "TemplateLanguage": true
            }]
        });

        console.log('[MAILJET_SUCCESS] Live SOS packet dispatched via API SDK.');
        return true;
    } catch (error) {
        console.error('[MAILJET_DISPATCH_FAULT] API Failure:', error.message);
        return false;
    }
};
