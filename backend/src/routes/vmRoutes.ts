import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/info', (req, res) => {
    res.send("This is public sandbox info page.");
})

router.get('/vms', authenticateToken, (req, res) => {
    const userID = req.user.id;
    res.json({ message: `Fetching VM's for user ${userID}` });
})

export default router;