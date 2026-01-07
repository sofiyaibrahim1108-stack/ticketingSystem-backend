const categoryQuery = {

    getCategoryByName: `
    SELECT * FROM category WHERE categoryName = ? AND deletedAt IS NULL
`,

    insertCategory : `
    INSERT INTO category (categoryName, createdBy) VALUES (?, ?)
`,

    SELECT_ALL : `
    SELECT 
    c.categoryId,
    c.categoryName,
    COUNT(t.ticketId) AS ticketCount 
    FROM category c
    LEFT JOIN ticket t 
    ON t.categoryId = c.categoryId
    AND t.deletedAt IS NULL
    GROUP BY c.categoryId 
    ORDER BY c.categoryId DESC 
    LIMIT ? OFFSET ?
`,

    COUNT_ALL : `
    SELECT COUNT(*) AS total
    FROM category
    WHERE deletedAt IS NULL
`,

    updateCategory : `
    UPDATE category SET categoryName = ? WHERE categoryId = ? AND deletedAt IS NULL
`,

    checkCategoryUsed:`SELECT COUNT(*) AS COUNT FROM ticket WHERE categoryId = ? AND deletedAt IS NULL`,

    deleteCategory : `
    UPDATE category SET deletedAt = NOW() WHERE categoryId = ?
`,
}
export default categoryQuery
