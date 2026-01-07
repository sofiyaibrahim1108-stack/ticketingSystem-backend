import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import ticketStatusQuery from "../queries/ticketStatusQuery.js";

export function createTicketStatus(req, res) {
    const { status } = req.body

    if (!status) {
        req.log.error("status is missing")
        return res.status(400).json({ success: false, message: "Status is required" });

    }

    req.db.execute(ticketStatusQuery.getStatusByName, [status], (err, result) => {
        if (err) {
            req.log.error("DB error", err);
            return res.status(500).json({ success: false, message: "db error" })
        }
        if (result.length > 0) {
            return res.status(409).json({ success: false, message: "Status aldready exist" })
        }


        req.db.execute(ticketStatusQuery.insertStatus, [status], (err, result) => {
            if (err) {
                req.log.error("Failed to create status in DB", err);
                return res.status(500).json({ success: false, message: "Failed to create status" });

            }
            return res.json({ success: true, message: "Status created successfully", result });

        })
    })
}

//get all ticket status
export function getAllTicketStatus(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const offset = (page - 1) * limit;

    req.db.query(ticketStatusQuery.COUNT_ALL, (err, countResult) => {
        if (err) {
            req.log.error("db error count", err);
            return res.status(500).json({ success: false, message: "db error", error: err });
        }

        const total = countResult[0].total;

        req.db.query(ticketStatusQuery.SELECT_ALL, [limit, offset], (err, result) => {
            if (err) {
                req.log.error("DB error while fetching statuses", err);
                return res.status(500).json({ success: false, message: "DB error", error: err });
            }
            return res.json({ success: true, status: result, total, page, limit });
        })
    })
}


//update
export function updateTicketStatus(req, res) {
    const { statusId } = req.params
    const { status } = req.body


    if (!status) {
        req.log.error("status is required")
        return res.status(400).json({ success: false, message: "Status is required" });
    }

    req.db.execute(ticketStatusQuery.updateStatus, [status, statusId], (err, result) => {
        if (err) {
            req.log.error("DB error while updating status", err);
            return res.status(500).json({ success: false, message: "DB error", error: err });
        }
        return res.json({ success: true, message: "Status updated successfully", result });

    })
}

//deletestatus

export function deleteTicketStatus(req, res) {
    const { statusId } = req.params;

    req.db.query(ticketStatusQuery.checkStatusUsed, [statusId], (err, result) => {
        if (err) {
            req.log.error("DB error", err)
            return res.status(500).json({ success: false, message: "DB error" })
        }

        if (result[0].count > 0) {
            req.log.error("status is assigned to ticket. cannot delete")
            return res.status(400).json({ success: false, message: "status is assigned to ticket.cannot delete" })
        }


        req.db.execute(ticketStatusQuery.deleteStatus, [statusId], (err, result) => {
            if (err) {
                req.log.error("DB error while deleting status", err);
                return res.status(500).json({ success: false, message: "DB error", error: err });
            }

            return res.json({ success: true, message: "Status deleted successfully", result });
        });
    })
}


export function setUpTicketStatusRoutes(app) {
    app.get("/api/ticketStatus/list", authMiddleware, getAllTicketStatus)
    app.post("/api/ticketStatus", authMiddleware, adminMiddleware, createTicketStatus)
    app.put("/api/ticketStatus/:statusId", authMiddleware, adminMiddleware, updateTicketStatus)
    app.delete("/api/ticketStatus/:statusId", authMiddleware, adminMiddleware, deleteTicketStatus)

}

export default { setUpTicketStatusRoutes };
