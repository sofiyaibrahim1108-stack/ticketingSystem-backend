import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import categoryQuery from "../queries/categoryQuery.js";

// CREATE
export function createCategory(req, res) {
    const { categoryName } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!categoryName) {
        req.log.error("category name is missing");
        return res.status(400).json({ success: false, message: "category name is missing" });
    }

    req.db.execute(categoryQuery.getCategoryByName, [categoryName], (err, result) => {
        if (err) {
            req.log.error("db error", err);
            return res.status(500).json({ success: false, message: "Db error" });
        }

        if (result.length > 0) {
            req.log.error("category already exist");
            return res.status(409).json({ success: false, message: "category already exists" });
        }

        req.db.execute(categoryQuery.insertCategory, [categoryName, userId], (err, result) => {
            if (err) {
                req.log.error("failed to create in db", err);
                return res.status(500).json({ success: false, message: "failed to create db" });
            }

            return res.json({ success: true, message: "category created successfully", result });
        });
    });
}

// GET ALL WITH PAGINATION
export function getCategory(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const offset = (page - 1) * limit;

    // Get total count
    req.db.query(categoryQuery.COUNT_ALL, (err, countResult) => {
        if (err) {
            req.log.error("db error count", err);
            return res.status(500).json({ success: false, message: "db error", error: err });
        }

        const total = countResult[0].total;

        req.db.query(categoryQuery.SELECT_ALL,
            [limit, offset], (err, result) => {
                if (err) {
                    req.log.error("db error in get", err);
                    return res.status(500).json({ success: false, message: "db error", error: err });
                }

                return res.json({ success: true, category: result, total, page, limit });
            });
    });
}

// UPDATE CATEGORY
export function updateCategory(req, res) {
    const { categoryId } = req.params;
    const { categoryName } = req.body;

    if (!categoryName) {
        req.log.error("category name is required");
        return res.status(400).json({ success: false, message: "Category name is required" });
    }

    req.db.execute(categoryQuery.updateCategory, [categoryName, categoryId], (err, result) => {
        if (err) {
            req.log.error("db error in update", err);
            return res.status(500).json({ success: false, message: "DB error", error: err });
        }
        return res.json({ success: true, message: "Category updated successfully", result });
    });
}

// DELETE CATEGORY
export function deleteCategory(req, res) {
    const { categoryId } = req.params;

    req.db.query(categoryQuery.checkCategoryUsed, [categoryId], (err, result) => {
        if (err) {
            req.log.error("DB error", err)
            return res.status(500).json({ success: false, message: "DB error" })
        }

        if (result[0].COUNT > 0) {
            req.log.error("category is assigned to ticket.cannot delete")
            return res.status(400).json({ success: false, message: "Category is assigned to ticket.cannot delete" })
        }


        req.db.execute(categoryQuery.deleteCategory, [categoryId], (err, result) => {
            if (err) {
                req.log.error("db error", err);
                return res.status(500).json({ success: false, message: "DB error", error: err });
            }
            return res.json({ success: true, message: "Category deleted successfully", result });
        });
    })
}

//GET CATEGORY BY ID
export function getCategoryById(req, res) {
  const { categoryId } = req.params
  console.log("Fetching categoryId:", categoryId);

  req.db.query(categoryQuery.getCategoryById, [categoryId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "db error" })

    console.log("DB result:", result);

    if (result.length === 0) return res.status(404).json({ success: false, message: "category not found" })

    return res.json({ success: true, category: result[0] })
  })
}


// SETUP ROUTES
export function setUpCategoryRoutes(app) {
    app.get("/api/category/list", authMiddleware, adminMiddleware, getCategory);
    app.get("/api/category/:categoryId", authMiddleware, adminMiddleware, getCategoryById)
    app.post("/api/category", authMiddleware, adminMiddleware, createCategory);
    app.put("/api/category/:categoryId", authMiddleware, adminMiddleware, updateCategory);
    app.delete("/api/category/:categoryId", authMiddleware, adminMiddleware, deleteCategory);
}

export default { setUpCategoryRoutes };
