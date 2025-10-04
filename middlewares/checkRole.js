module.exports = function checkRole(expected) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ message: "Unauthorized" });

    if (Array.isArray(expected)) {
      if (!expected.includes(role)) {
        return res
          .status(403)
          .json({ message: `Access denied: allowed roles ${expected}` });
      }
    } else {
      if (role !== expected) {
        return res
          .status(403)
          .json({ message: `Access denied: ${expected} only` });
      }
    }

    return next();
  };
};
