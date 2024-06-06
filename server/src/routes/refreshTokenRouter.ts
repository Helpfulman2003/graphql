import express from 'express';
import { Secret, verify } from 'jsonwebtoken';
import { UserAuthPayload } from '../types/UserAuthPayload';
import { createToken, sendRefreshToken } from '../utils/auth';
import { User } from '../entities/User';

const router = express.Router();

router.get('/', async (req, res) => {
    const refreshToken = req.cookies[process.env.REFRESH_TOKEN as string];
    if (!refreshToken) {
        return res.sendStatus(401);
    }
    try {
        const decoded = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as Secret) as UserAuthPayload;
        const existingUser = await User.findOne({ where: { id: decoded.userId } });
        if (!existingUser) {
            return res.sendStatus(401);
        }
        sendRefreshToken(res, existingUser);
        return res.json({
            success: true,
            accessToken: createToken('accessToken', existingUser)
        });
    } catch (error) {
        console.log("Error refresh token", error);
        return res.sendStatus(403);
    }
});

export default router;
