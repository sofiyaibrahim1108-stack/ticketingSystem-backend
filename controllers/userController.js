import bcrypt from "bcrypt";
import userQuery from "../queries/userQuery.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";


//get all user

export function userListJson(req, res) {
   req.db.query(userQuery.SELECT_ALL, (err, result) => {
  console.log(err, result);
  if (err) {
    req.log.error("DB error in user:", err);
    return res.status(500).json({ success: false, message: "Db error" });
  }
  res.json({ success: true, user: result });
});

}


// //get single user
// export function userGet(req, res) {
//     const { userId } = req.params

//     req.db.query(userQuery.SELECT_ONE, [userId], (err, result) => {
//         if (err) {
//             req.log.error("db error");
//             return res.status(500).json({ success: false, message: "db error" });
//         }

//         if (result.length === 0) {
//             req.log.error("user not found");
//             return res.status(404).json({ success: false, message: "user not found" });
//         }
//         res.json({ success: true, user: result[0] });
//     });
// }

// //insert
// export async function userCreate(req, res) {
//     const { username, email, password, role } = req.body

//     const hashedPassword = await bcrypt.hash(password, 10)

//     req.db.query(userQuery.INSERT_USER, [username, email, hashedPassword, role], (err, result) => {
//         if (err) {
//             req.log.error("insert failed")
//             return res.status(500).json({ success: false, message: "insert failed in db" })
//         }
//         res.status(201).json({ success: true, message: "user created" })
//     })
// }

// //update

// export async function userUpdate(req, res) {
//     const { userId } = req.params
//     const { username, email, role } = req.body
   
//     req.db.query(userQuery.UPDATE_USER, [username, email, role, userId], (err, result) => {
//         if (err) {
//             req.log.error("update failed")
//             return res.status(500).json({ success: false, message: "Update failed in db" })
//         }
//         res.json({ success: true, message: "user updated" })
//     })

// }


// //delete user
// export function userDelete(req, res) {
//     const { userId } = req.params

//     req.db.query(userQuery.DELETE_USER, [userId], (err, result) => {
//         if (err) {
//             req.log.error("delete failed")
//             return res.status(500).json({ success: false, message: "delete failed in db" })
//         }
//         res.json({ success: true, message: "user deleted" })
//     })
// }

export function setUpUserRoutes(app) {
    app.get("/api/user/list", authMiddleware,userListJson)
    // app.get("/api/user/:userId", authMiddleware, adminMiddleware, userGet)
    // app.post("/api/user", authMiddleware, adminMiddleware, userCreate)
    // app.put("/api/user/:userId", authMiddleware, adminMiddleware, userUpdate)
    // app.delete("/api/user/:userId", authMiddleware, adminMiddleware, userDelete)
}

export default { setUpUserRoutes };