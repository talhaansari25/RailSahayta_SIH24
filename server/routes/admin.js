
import express from 'express'
import { addStaff, getCompByDept, getStaffByDept, loginAdmin } from '../controllers/admin.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router()

router.post('/loginadmin', loginAdmin)
router.post('/addstaff', addStaff)
router.post('/deptcomp', getCompByDept)
router.post('/getstaffbydept', getStaffByDept)

export default router;