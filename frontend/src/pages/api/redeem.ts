import { NextApiRequest, NextApiResponse } from 'next';
import redisClient from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { points, publicKey, tokenAmount, tokenAddress } = req.body;
        
        if (!points || !publicKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const redemptionData = {
            publicKey,
            points,
            tokenAmount: tokenAmount || null,
            tokenAddress: tokenAddress || null,
            timestamp: new Date().toISOString(),
            status: 'pending',
            tokenType: tokenAddress ? 'SONIC' : 'SOL'
        };

        await redisClient.zAdd('redemptions', {
            score: Date.now(),
            value: JSON.stringify(redemptionData)
        });

        return res.status(200).json({ 
            success: true, 
            message: 'Redemption recorded successfully' 
        });
    } catch (error) {
        console.error('Redemption error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}