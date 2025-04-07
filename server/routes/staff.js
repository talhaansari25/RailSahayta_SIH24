
import express from 'express'
import { assignedComp, getCookiesDet, getStaffProfile, loginStaff, removeCookie, solvedComp, updateCompStatus } from '../controllers/staff.js'
import { verifyToken } from '../middleware/auth.js';

const router = express.Router()

router.post('/loginstaff', loginStaff)
router.post('/assignedcomp', assignedComp)
router.post('/solvedcomp', solvedComp)
router.post('/updatecompstatus', updateCompStatus)
router.post('/getcookiesdept', getCookiesDet)
router.post('/profile', getStaffProfile)
router.post('/removecookie', removeCookie)

export default router;
