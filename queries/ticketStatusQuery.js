

const ticketStatusQuery = {
    getStatusByName: `SELECT * FROM ticketStatus WHERE status = ? AND deletedAt IS NULL`,

    insertStatus: `INSERT INTO ticketStatus (status) VALUES (?)`,

    SELECT_ALL: `
    SELECT 
    s.statusId,
    s.status,
    COUNT(t.ticketId) AS ticketCount
    FROM ticketStatus s
    LEFT JOIN ticket t
    ON t.statusId = s.statusId
    AND t.deletedAt IS NULL
    GROUP BY s.statusId
    ORDER BY s.statusId DESC
    LIMIT ? OFFSET ?
    `,
    COUNT_ALL: `SELECT COUNT(*) AS total FROM ticketStatus WHERE deletedAt IS NULL`,

    updateStatus: `UPDATE ticketStatus SET status = ? WHERE statusId = ? AND deletedAt IS NULL`,

    checkStatusUsed: `SELECT COUNT(*) AS count FROM ticket WHERE statusId = ? AND deletedAt IS NULL`,

    deleteStatus: `UPDATE ticketStatus SET deletedAt = NOW() WHERE statusId = ?`
}

export default ticketStatusQuery;