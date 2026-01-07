import commentQuery from "../queries/commentQuery.js"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { adminMiddleware } from "../middleware/adminMiddleware.js";


export function createComment(req, res) {
    const { ticketId, statusId, comment } = req.body
    const userId = req.user.userId
    // const role = req.user.role
    if (!ticketId || !statusId || !comment) {
        req.log.error("all fields required")
        return res.status(400).json({ success: false, message: "ticketid ,statusid and comment are required" })
    }

    //check ticket exists
    req.db.query(commentQuery.getTicketById, [ticketId], (err, result) => {
        if (err) {
            req.log.error("Db error", err)
            return res.status(500).json({ success: false, message: "db error" })
        }
        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "ticket not found" })
        }

        //if user,check ownership
        // if (role !== "admin" && result[0].userId !== userId) {
        //     return res.status(403).json({ success: false, message: "cannot comment on this ticket" })
        // }

        //insert comment
        req.db.execute(commentQuery.insertComment, [ticketId, userId, statusId, comment], (err, result) => {
            if (err) {
                req.log.error("DB error while creating comment", err)
                return res.status(500).json({ success: false, message: "failed to add comment" })
            }
            return res.json({ success: true, message: "comment added successfully", result })
        })
    })

}

//grt ticket
export function getCommentByTicket(req, res) {
    const { ticketId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 4
    const offset = (page - 1) * limit

    req.db.query(commentQuery.countByTicket, [ticketId], (err, countResult) => {
      
        if (err) {
            req.log.error("DB error", err)
            return res.status(500).json({ success: false, message: "DB error" })
        }
        const total = countResult[0].total

        req.db.query(commentQuery.selectByTicket, [ticketId, limit, offset], (err, result) => {
            if (err) {
                req.log.error("DB error", err)
                return res.status(500).json({ success: false, message: "DB error" })
            }
              console.log("DB RESULT 👉", result)

            return res.json({ success: true, comment: result, total, page, limit })
        })
    })
}

//update
export function updateComment(req, res) {
    const { commentId } = req.params
    const { comment, statusId } = req.body
    const userId = req.user.userId

    if (!comment ||! statusId) {
        req.log.error("All fileds are required")
        return res.status(400).json({ success: false, message: "comment and statusid are required" })
    }

    req.db.execute(commentQuery.updateComment, [comment, statusId, commentId, userId], (err, result) => {
        if (err) {
            req.log.error("DB error while updating comment", err)
            return res.status(500).json({ success: false, message: "db error" })
        }
        return res.json({ success: true, message: "comment updated successfully" })
    })
}

//delete
export function deleteComment(req, res) {
    const { commentId } = req.params
    const userId = req.user.userId


    req.db.execute(commentQuery.deleteComment, [commentId, userId], (err, result) => {
        if (err) {
            req.log.error("DB error while deleting comment", err)
            return res.status(500).json({ success: false, message: "DB error" })
        }
        // if(result.affectedRow == 0){
        //     return res.status(403).json({success:false,message:"Not allowed to delete this comment"})
        // }

        return res.json({ success: true, message: "comment deleted successfully" })
    })
}


export function setUpCommentRoutes(app) {
    app.get("/api/comment/ticket/:ticketId", authMiddleware, getCommentByTicket)
    app.post("/api/comment", authMiddleware,adminMiddleware, createComment)
    app.put("/api/comment/:commentId", authMiddleware,adminMiddleware, updateComment)
    app.delete("/api/comment/:commentId", authMiddleware,adminMiddleware, deleteComment)
}

export default { setUpCommentRoutes }