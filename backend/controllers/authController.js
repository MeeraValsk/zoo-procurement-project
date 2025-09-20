const userDAO = require('../dao/userDAO');
const jwt = require('jsonwebtoken');

class AuthController {
  // Register a new user
  async register(req, res) {
    try {
      const { username, email, password, name, role, zoo, company } = req.body;

      // Check if user already exists
      const existingUser = await userDAO.findByEmailOrUsername(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Create new user
      const user = await userDAO.createUser({
        username,
        email,
        password,
        name,
        role,
        zoo,
        company
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
            zoo: user.zoo,
            company: user.company
          },
          token
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await userDAO.findByEmailOrUsername(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Verify password
      const isPasswordValid = await userDAO.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
            zoo: user.zoo,
            company: user.company
          },
          token
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await userDAO.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { name, email, zoo, company } = req.body;
      const userId = req.user.userId;

      const updatedUser = await userDAO.updateUser(userId, {
        name,
        email,
        zoo,
        company
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const users = await userDAO.getAllUsers();
      res.json({
        success: true,
        data: { users }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get users by role
  async getUsersByRole(req, res) {
    try {
      const { role } = req.params;
      const users = await userDAO.getUsersByRole(role);
      res.json({
        success: true,
        data: { users }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update user (admin only)
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const { username, email, password, role } = req.body;

      const updatedUser = await userDAO.updateUser(userId, {
        username,
        email,
        password,
        role
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete user (admin only)
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      const deletedUser = await userDAO.deleteUser(userId);

      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get suppliers (users with role 'supplier')
  async getSuppliers(req, res) {
    try {
      const suppliers = await userDAO.getUsersByRole('supplier');
      
      res.json({
        success: true,
        data: { suppliers }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get suppliers by speciality
  async getSuppliersBySpeciality(req, res) {
    try {
      const { speciality } = req.params;
      const suppliers = await userDAO.getSuppliersBySpeciality(speciality);
      
      res.json({
        success: true,
        data: { suppliers }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();
