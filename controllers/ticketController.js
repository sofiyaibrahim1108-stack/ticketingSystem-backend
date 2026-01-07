import ticketQuery from "../queries/ticketQuery.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

//insert
export  function createTicket(req, res) {
    const { ticketTitle, description, statusId, categoryId, userId } = req.body


    if (!ticketTitle || !description || !statusId || !categoryId || !userId) {
        req.log.error("All fileds are required")
        return res.status(400).json({ success: false, message: "ticketTitle, description and statusId are required" })
    }

    req.db.execute(ticketQuery.getTicketByName, [ticketTitle], (err, result) => {
        if (err) {
            req.log.error("db error", err)
            return res.status(500).json({ success: false, message: "db error" })
        }
        if (result.length > 0) {
            return res.status(409).json({ success: false, message: "ticketTitle aldready exist" })
        }


        req.db.execute(ticketQuery.insertTicket, [ticketTitle, description, statusId, categoryId, userId], (err, result) => {
            if (err) {
                req.log.error("DB error while creating ticket", err)
                return res.status(500).json({ success: false, message: "failed to create ticket" })
            }

            return res.json({ success: true, message: "ticket created successfully", result })
        })
    })
}

//get ALL
export function getAllTicket(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const offset = (page - 1) * limit;

    // User dashboard: only show user's own tickets
    if (req.user.role.toUpperCase() === "USER") {
        req.db.query(ticketQuery.countByUser, [req.user.userId], (err, countResult) => {
            if (err) {
                req.log.error("DB error while geting all ticket", err)
                return res.status(500).json({ success: false, message: "Cannot get user ticket count" });
            }

            const total = countResult[0].total;

            req.db.query(ticketQuery.selectByUser, [req.user.userId, limit, offset], (err, result) => {
                if (err) {
                    req.log.error("DB error while geting all ticket", err)
                    return res.status(500).json({ success: false, message: "Cannot get user tickets" });
                }

                return res.json({ success: true, message: "User tickets fetched", ticket: result, total, page, limit });
            });
        });
        return;
    }

    // Admin dashboard: show all tickets
    req.db.query(ticketQuery.countAll, (err, countResult) => {
        if (err) {

            req.log.error("DB error while geting ticket", err)
            return res.status(500).json({ success: false, message: "Cannot get total tickets" });
        }

        const total = countResult[0].total;

        req.db.query(ticketQuery.selectAll, [limit, offset], (err, result) => {
            if (err) {

                req.log.error("DB error while geting ticket", err)
                return res.status(500).json({ success: false, message: "Cannot get admin tickets" });
            }

            return res.json({ success: true, message: "All tickets fetched", ticket: result, total, page, limit });
        });
    });
}

//get ticket by id
export function getTicketById(req, res) {
    const { ticketId } = req.params;

    req.db.query(ticketQuery.getTicketById, [ticketId], (err, result) => {
        if (err) {
            req.log.error("DB error while geting ticket", err)
            return res.status(500).json({ success: false, message: "DB error" });
        }
        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        return res.json(result[0]);
    });
}

//update
export function updateTicket(req, res) {
    const { ticketId } = req.params
    const { ticketTitle, description, statusId, categoryId, userId } = req.body


    if (!ticketTitle || !description || !statusId || !categoryId || !userId) {
        req.log.error("All fileds are required")
        return res.status(400).json({ success: false, message: "ticketTitle, description and statusId are required" })
    }

    req.db.execute(ticketQuery.updateTicket, [ticketTitle, description, userId, statusId, categoryId, ticketId], (err, result) => {
        if (err) {
            req.log.error("DB error while updating ticket", err);
            return res.status(500).json({ success: false, message: "Db error" })
        }
        return res.json({ success: true, message: "ticket updated successfully", result })
    })

}

//for user
export function updateTicketStatus(req, res) {
    const { ticketId } = req.params;
    const { statusId } = req.body;

    if (!statusId) return res.status(400).json({ success: false, message: "statusId required" });

    req.db.execute(
        ticketQuery.updateTicketStatus,
        [statusId, ticketId],
        (err, result) => {
            if (err) {
                req.log.error("DB error while updating ticket status", err);
                return res.status(500).json({ success: false, message: "DB error" });
            }
            return res.json({ success: true, message: "Ticket status updated" });
        }
    );
}


//delete
export function deleteTicket(req, res) {
    const { ticketId } = req.params

    req.db.execute(ticketQuery.deleteTicket, [ticketId], (err, result) => {
        if (err) {
            req.log.error("DB error while deleting ticket", err);
            return res.status(500).json({ success: false, message: "db error" })
        }
        return res.json({ success: true, message: "ticket deleted successfully" })
    })
}

export function setUpTicketRoutes(app) {
    app.get("/api/ticket/list", authMiddleware, getAllTicket)
    app.get("/api/ticket/:ticketId", authMiddleware, getTicketById)
    app.post("/api/ticket", authMiddleware, adminMiddleware, createTicket)
    app.put("/api/ticket/:ticketId", authMiddleware,adminMiddleware, updateTicket)
    app.put("/api/ticket/:ticketId/status", authMiddleware, updateTicketStatus);
    app.delete("/api/ticket/:ticketId", authMiddleware, adminMiddleware, deleteTicket)


}

export default { setUpTicketRoutes };
