const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middleware/auth');
const { supabaseAdmin } = require('../utils/supabase');

// Get all users with pagination and filters
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      role = '', 
      status = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        message: 'Admin client not configured'
      });
    }

    // Build the query - fetch profiles without credits join for now
    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' });

    // Apply search filter (search by name or email)
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply role filter
    if (role) {
      query = query.eq('role', role);
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: users, error, count } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      });
    }

    // Format the user data
    const formattedUsers = await Promise.all(users.map(async (user) => {
      // Try to fetch credits separately
      let userCredits = 0;
      try {
        const { data: creditsData } = await supabaseAdmin
          .from('user_credits')
          .select('balance')
          .eq('user_id', user.id)
          .single();
        userCredits = creditsData?.balance || 0;
      } catch (err) {
        // If credits don't exist, default to 0
        userCredits = 0;
      }

      // Try to fetch subscription plan
      let userPlan = 'Free';
      try {
        const { data: subscriptionData } = await supabaseAdmin
          .from('subscriptions')
          .select('plans:plan_id(name, display_name)')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        
        if (subscriptionData && subscriptionData.plans) {
          userPlan = subscriptionData.plans.display_name || subscriptionData.plans.name || 'Free';
        }
      } catch (err) {
        // If subscription doesn't exist, default to 'Free'
        userPlan = 'Free';
      }

      return {
        id: user.id,
        name: user.name || user.full_name || user.display_name || 'Unknown User',
        email: user.email,
        role: user.role || 'user',
        status: user.status || 'active',
        plan: (user.role === 'admin') ? 'Admin' : userPlan,
        credits: userCredits,
        joinDate: user.created_at,
        lastLogin: user.last_login || null,
        profilePicture: user.avatar_url || null,
        verified: user.email_verified || false
      };
    }));

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get user statistics
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        message: 'Admin client not configured'
      });
    }

    // Get total users count
    const { count: totalUsers, error: totalError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Get active users count
    const { count: activeUsers, error: activeError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (activeError) throw activeError;

    // Get suspended users count
    const { count: suspendedUsers, error: suspendedError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'suspended');

    if (suspendedError) throw suspendedError;

    // Get admin users count
    const { count: adminUsers, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    if (adminError) throw adminError;

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newUsersThisMonth, error: newUsersError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    if (newUsersError) throw newUsersError;

    res.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        suspendedUsers: suspendedUsers || 0,
        adminUsers: adminUsers || 0,
        newUsersThisMonth: newUsersThisMonth || 0
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
});

// Get specific user details
router.get('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        message: 'Admin client not configured'
      });
    }

    // Fetch user profile
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch user credits
    let userCredits = 0;
    try {
      const { data: creditsData } = await supabaseAdmin
        .from('user_credits')
        .select('balance')
        .eq('user_id', id)
        .single();
      userCredits = creditsData?.balance || 0;
    } catch (err) {
      // If credits don't exist, default to 0
      userCredits = 0;
    }

    // Fetch user's subscription plan
    let userPlan = 'free';
    try {
      const { data: subscriptionData } = await supabaseAdmin
        .from('subscriptions')
        .select('plans:plan_id(name, display_name)')
        .eq('user_id', id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (subscriptionData && subscriptionData.plans) {
        userPlan = subscriptionData.plans.display_name || subscriptionData.plans.name || 'free';
      }
    } catch (err) {
      // If subscription doesn't exist, default to 'free'
      userPlan = 'free';
    }

    // Fetch user's recent generations count
    const { count: generationsCount, error: genError } = await supabaseAdmin
      .from('generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id);

    const formattedUser = {
      id: user.id,
      name: user.name || user.full_name || user.display_name || 'Unknown User',
      email: user.email,
      role: user.role || 'user',
      status: user.status || 'active',
      plan: (user.role === 'admin') ? 'Admin' : userPlan,
      credits: userCredits,
      joinDate: user.created_at,
      lastLogin: user.last_login || null,
      profilePicture: user.avatar_url || null,
      verified: user.email_verified || false,
      totalGenerations: generationsCount || 0
    };

    res.json({
      success: true,
      data: formattedUser
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
});

// Update user status (activate/suspend)
router.put('/:id/status', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'suspended', 'deleted', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: active, suspended, deleted, or pending'
      });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        message: 'Admin client not configured'
      });
    }

    // Prevent admin from suspending themselves
    if (id === req.user._id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own status'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update user status',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: `User ${status === 'active' ? 'activated' : status === 'suspended' ? 'suspended' : 'status updated'} successfully`,
      data: {
        id: data.id,
        status: data.status
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update user role
router.put('/:id/role', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "user" or "admin"'
      });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        message: 'Admin client not configured'
      });
    }

    // Prevent admin from changing their own role
    if (id === req.user._id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update user role',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: {
        id: data.id,
        role: data.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Delete user (soft delete by setting status to deleted)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        message: 'Admin client not configured'
      });
    }

    // Prevent admin from deleting themselves
    if (id === req.user._id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        id: data.id
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Bulk update users
router.put('/bulk/update', auth, requireAdmin, async (req, res) => {
  try {
    const { userIds, updates } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Updates object is required'
      });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        message: 'Admin client not configured'
      });
    }

    // Prevent admin from updating themselves
    if (userIds.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot bulk update your own account'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to bulk update users',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: `${data.length} users updated successfully`,
      data: {
        updatedCount: data.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;

