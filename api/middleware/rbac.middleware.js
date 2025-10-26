/**
 * Role-Based Access Control (RBAC) middleware
 * Checks if the authenticated user has the required role(s)
 * 
 * @param {Array<string>} allowedRoles - Array of roles allowed to access the route
 * @returns {Function} Express middleware function
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated (auth middleware should run first)
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Forbidden: You do not have permission to access this resource' 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = { checkRole };
