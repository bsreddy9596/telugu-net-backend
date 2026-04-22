module.exports = function checkRole(expected) {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing user role" });
    }

    if (Array.isArray(expected)) {
      if (!expected.includes(role)) {
        console.warn(`Access denied: user role=${role}, allowed=${expected}`);
        return res.status(403).json({
          message: `Access denied: allowed roles ${expected.join(", ")}`,
        });
      }
    } else if (expected && role !== expected) {
      console.warn(`Access denied: user role=${role}, expected=${expected}`);
      return res
        .status(403)
        .json({ message: `Access denied: ${expected} only` });
    }

    next();
  };
};
