
import express from 'express'
import { accessMedia, addComplaint, reraiseComplaint, submitFeedback, uploadMedia, viewUserComplaint } from '../controllers/user.js'
import {verifyToken} from '../middleware/auth.js'
import multer from 'multer';
import path from 'path';

const router = express.Router()

router.post('/addcomplaint', addComplaint)
router.post('/viewusercomp', viewUserComplaint)
router.post('/submitfeedback', submitFeedback)
router.post('/reraisecomp', reraiseComplaint)

// Upload media
router.post('/uploadmedia' , uploadMedia);

// Access media
router.get('/media/:filename', accessMedia);

export default router;
