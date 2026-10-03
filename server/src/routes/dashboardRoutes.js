import {Router} from 'express'
import {inventorySummary} from '../controllers/dashboardController.js'
const router=Router()
router.get('/inventory',inventorySummary)
export default router
