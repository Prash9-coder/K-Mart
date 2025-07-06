import express from 'express';
import {
  getInventoryItems,
  getInventoryByProduct,
  createInventory,
  updateInventory,
  addStockMovement,
  reserveStock,
  releaseReservedStock,
  getLowStockAlerts,
  getActiveAlerts,
  acknowledgeAlert,
  getReorderList,
  addBatch,
  getInventoryAnalytics
} from '../controllers/inventoryController.js';
import { protectAdmin, checkPermission } from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

// All routes require admin authentication and inventory management permission
router.use(protectAdmin);
router.use(checkPermission('manage-inventory'));

// Main inventory routes
router.route('/')
  .get(getInventoryItems)
  .post(createInventory);

router.get('/analytics', getInventoryAnalytics);
router.get('/alerts/low-stock', getLowStockAlerts);
router.get('/alerts', getActiveAlerts);
router.get('/reorder', getReorderList);

router.get('/product/:productId', getInventoryByProduct);

router.route('/:id')
  .put(updateInventory);

// Stock management
router.post('/:id/movement', addStockMovement);
router.post('/:id/reserve', reserveStock);
router.post('/:id/release', releaseReservedStock);
router.post('/:id/batch', addBatch);

// Alert management
router.put('/alerts/:alertId/acknowledge', acknowledgeAlert);

export default router;