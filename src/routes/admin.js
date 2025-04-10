const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/users/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    } 
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid user ID' });
    } 
    res.status(500).json({ error: 'Server error' });
  }
});
router.patch('/users/:id', 
  auth, 
  admin,
  [
    body('username').optional().trim().isLength({ min: 3 }),
    body('email').optional().isEmail(),
    body('role').optional().isIn(['core', 'admin'])
  ], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { username, email, role } = req.body;
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (role) updateData.role = role;      
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      ).select('-password');      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }      
      res.json({ 
        message: 'User updated successfully',
        user 
      });
    } catch (error) {
      console.error('Update user error:', error);     
      if (error.kind === 'ObjectId') {
        return res.status(400).json({ error: 'Invalid user ID' });
      }      
      res.status(500).json({ error: 'Server error' });
    }
});
router.delete('/users/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }    
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'Admins cannot delete their own account through this endpoint' });
    }    
    await User.findByIdAndRemove(req.params.id);    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }    
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const coreUserCount = await User.countDocuments({ role: 'core' });
    const latestUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);    
    res.json({
      stats: {
        totalUsers: userCount,
        adminUsers: adminCount,
        coreUsers: coreUserCount,
      },
      latestUsers
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router; 