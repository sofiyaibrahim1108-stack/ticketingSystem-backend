const userQuery = {
  SELECT_ALL:
    `SELECT userId, username, role FROM user WHERE deletedAt IS NULL ORDER BY userId DESC`,


    SELECT_ONE: `
    SELECT 
      userId,
      username,
      email,
      role,
    FROM user
    WHERE userId = ? AND deletedAt IS NULL
  `,
    INSERT_USER: `
    INSERT INTO user (
      username,
      email,
      password,
      role
    )
    VALUES (?, ?, ?, ?)
  `,

    UPDATE_USER: `
    UPDATE user
    SET
      username = ?,
      email = ?,
      role = ?
    WHERE userId = ? AND deletedAt IS NULL
  `,
    DELETE_USER: `
    UPDATE user
    SET
      deletedAt = NOW()
    WHERE userId = ? AND deletedAt IS NULL
  `

}
export default userQuery