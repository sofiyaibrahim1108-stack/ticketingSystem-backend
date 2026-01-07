

const ticketQuery = {
  getTicketByName: `SELECT * FROM ticket WHERE ticketTitle =? AND deletedAt IS NULL`,


  insertTicket: `INSERT INTO ticket (ticketTitle,description,statusId,categoryId,userId) Values(?,?,?,?,?)`,

  countAll: `SELECT COUNT(*) AS total FROM ticket WHERE deletedAt IS NULL`,

  updateTicket: `UPDATE ticket SET ticketTitle = ? ,description = ?,userId=?,statusId =?,categoryId =? WHERE ticketId =? AND deletedAt IS NULL`,

  updateTicketStatus: `UPDATE ticket SET statusId = ? WHERE ticketId = ? AND deletedAt IS NULL`,

  deleteTicket: `UPDATE ticket SET deletedAt = NOW() WHERE ticketId = ?`,

  selectAll: `SELECT
        t.ticketId,
        t.ticketTitle,
        t.description,
        
        ts.statusId,
        ts.status,
        
        c.categoryId,
        c.categoryName,
        
        u.userId,
        u.username
        
        FROM ticket t
        JOIN ticketStatus ts ON t.statusId = ts.statusId
        JOIN category c ON t.categoryId = c.categoryId
        JOIN user u ON t.userId = u.userId
        
        WHERE t.deletedAt IS NULL
        ORDER BY t.ticketId DESC
        LIMIT ? OFFSET ?`,


  countByUser: `
    SELECT COUNT(*) AS total
    FROM ticket
    WHERE deletedAt IS NULL AND userId = ?
  `,
  selectByUser: `
  SELECT DISTINCT
    t.ticketId,
    t.ticketTitle,
    t.description,
    ts.statusId,
    ts.status AS statusName,
    c.categoryName
  FROM ticket t
  LEFT JOIN ticketStatus ts ON t.statusId = ts.statusId
  LEFT JOIN category c ON t.categoryId = c.categoryId
  WHERE t.deletedAt IS NULL AND t.userId = ?
  ORDER BY t.ticketId DESC
  LIMIT ? OFFSET ?
`,
  getTicketById: `
  SELECT 
  t.ticketId,
  t.ticketTitle,
  t.userId,
  t.statusId,
  ts.status       
FROM ticket t
LEFT JOIN ticketStatus ts ON t.statusId = ts.statusId
WHERE t.ticketId = ? AND t.deletedAt IS NULL
`

}

export default ticketQuery