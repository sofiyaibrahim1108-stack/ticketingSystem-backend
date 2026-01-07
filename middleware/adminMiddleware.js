export function adminMiddleware(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ success: false, error: "user not authenticated" });
    }

    // Convert role to uppercase so it matches "ADMIN"
    if (req.user.role.toUpperCase() !== "ADMIN") {
        return res.status(403).json({ success: false, error: "Access denied. Admin only" });
    }

    next();
}
