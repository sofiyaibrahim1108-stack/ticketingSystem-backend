
const commentQuery = {
    getTicketById: `SELECT ticketId,userId FROM ticket WHERE ticketId = ? AND deletedAt IS NULL`,

    insertComment: `INSERT INTO comment (ticketId,userId,statusId,comment) VALUES(?,?,?,?)`,

    countByTicket: `SELECT COUNT (*) AS TOTAL FROM comment WHERE ticketId = ? AND deletedAt IS NULL`,

    selectByTicket: `
    SELECT 
    c.commentId,
    c.comment,
    c.createdAt,
    u.userName,
    c.statusId,
    ts.status
    FROM comment c
    JOIn user u ON u.userId = c.userId
    JOIN ticketStatus ts ON ts.statusId = c.statusId
    WHERE c.ticketId = ? AND c.deletedAt IS NULL 
    ORDER BY c.createdAt ASC LIMIT ? OFFSET ?` ,

    updateComment: `UPDATE comment SET comment = ?,statusId = ? WHERE commentId = ? AND userId = ? AND deletedAt IS NULL`,


    deleteComment: `UPDATE comment SET deletedAt = NOW() WHERE commentId =? AND deletedAt IS NULL`
}

export default commentQuery