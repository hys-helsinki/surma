import prisma from '../../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function create(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const playerData = JSON.parse(req.body);
        const result = await prisma.player.create({data: playerData});
        res.status(201).json(result);
    }
}