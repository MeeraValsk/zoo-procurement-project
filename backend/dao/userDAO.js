const User = require('../models/User');
const bcrypt = require('bcryptjs');

class UserDAO {
  // Create a new user
  async createUser(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      return await user.save();
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Find user by email or username
  async findByEmailOrUsername(identifier) {
    try {
      return await User.findOne({
        $or: [
          { email: identifier },
          { username: identifier }
        ]
      });
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  // Find user by ID
  async findById(id) {
    try {
      return await User.findById(id).select('-password');
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  // Get all users
  async getAllUsers() {
    try {
      return await User.find({ isActive: true }).select('-password');
    } catch (error) {
      throw new Error(`Error getting users: ${error.message}`);
    }
  }

  // Get users by role
  async getUsersByRole(role) {
    try {
      return await User.find({ role, isActive: true }).select('-password');
    } catch (error) {
      throw new Error(`Error getting users by role: ${error.message}`);
    }
  }

  // Get suppliers by speciality
  async getSuppliersBySpeciality(speciality) {
    try {
      return await User.find({ 
        role: 'supplier', 
        speciality: { $regex: speciality, $options: 'i' },
        isActive: true 
      }).select('-password');
    } catch (error) {
      throw new Error(`Error getting suppliers by speciality: ${error.message}`);
    }
  }

  // Update user
  async updateUser(id, updateData) {
    try {
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Delete user (soft delete)
  async deleteUser(id) {
    try {
      return await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Verify password
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error(`Error verifying password: ${error.message}`);
    }
  }
}

module.exports = new UserDAO();
