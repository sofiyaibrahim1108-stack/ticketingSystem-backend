const authQuery = {
    getUserByEmail:`SELECT * FROM user WHERE email = ?`,

    insertUser:`INSERT INTO user (username,email,password,role) values(?,?,?,?)`,

    getUserByUsername:`SELECT * FROM user WHERE username = ?`,

    updatePasswordByUserId:`UPDATE user SET password=? WHERE userId = ?`,

    getUserById: `SELECT userId, username, role FROM user WHERE userId = ?`
}


export default authQuery;