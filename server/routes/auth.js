import express from 'express';
import { login, register, logout, checkAuth, resetPassword, updatePassword, fetchUserData, getPnrData } from '../controllers/auth.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/logout', verifyToken, logout);
router.get("/checkauth", checkAuth); 
router.post("/resetpassword", resetPassword); 
router.post("/fetchuserdata", fetchUserData); 
router.post("/updatepassword/:token", updatePassword); 
router.post("/pnrdata", getPnrData); 

export default router;