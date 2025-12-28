import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/admin.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();


router.use(verifyJWT);


const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

router.use(requireAdmin);

router.route('/users').get(getAllUsers);
router.route('/users/:userId').get(getUserById);
router.route('/users/:userId').patch(updateUser);
router.route('/users/:userId').delete(deleteUser);

export default router;
