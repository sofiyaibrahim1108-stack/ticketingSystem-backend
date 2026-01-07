import bcrypt from "bcrypt";    
import authQuery from "../queries/authQuery.js";
import { EncryptJWT, jwtDecrypt } from "jose";
import sendMail from "../utils/mail.js";

const otpStore = new Map();
const SECRET_KEY = new TextEncoder().encode(process.env.JWE_SECRET);

// signup
export async function signUp(req, res) {
    const { username, email, password, confirmPassword, role } = req.body;

    if (!username || !email || !password || !confirmPassword || !role) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    req.db.execute(authQuery.getUserByEmail, [email], async (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database error", error: err });
        }

        if (result.length > 0) {
            return res.status(409).json({ success: false, message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        req.db.execute(authQuery.insertUser, [username, email, hashedPassword, role], (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Failed to create user", error: err });
            }

            return res.json({ success: true, message: "Signup successful. Please login.", result });
        });
    });
}

// login
export async function login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username & password required" });
    }

    req.db.execute(authQuery.getUserByUsername, [username], async (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database error" });
        }
        if (result.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const user = result[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ success: false, message: "Invalid credentials" });

        if (!user.email) {
            return res.status(500).json({ success: false, message: "User email not defined, cannot send OTP" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        //  otpStore.delete(user.userId);
        const tempToken = await new EncryptJWT({
            userId: user.userId,
            purpose: "LOGIN"
        })
            .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
            .setExpirationTime("5m")
            .encrypt(SECRET_KEY);

        otpStore.set(user.userId, { otp, attempts: 0, expiresAt: Date.now() + 5 * 60 * 1000 });

        try {
            await sendMail({
                to: user.email,
                subject: "OTP Login",
                text: `Hi ${user.username}, your OTP is ${otp}. It expires in 5 minutes.`
            });
        } catch (mailErr) {
            console.error("Mail send failed:", mailErr);
            return res.status(500).json({ success: false, message: "Failed to send OTP email" });
        }


        return res.json({ success: true, message: "OTP sent", tempToken });
    });
}

// verify otp
export async function verifyOtp(req, res) {
    const { otp, tempToken } = req.body;

    if (!otp || !tempToken) {
        return res.status(400).json({ success: false, message: "OTP & token required" });
    }

    let payload;
    try {
        ({ payload } = await jwtDecrypt(tempToken, SECRET_KEY));
    } catch {
        return res.status(400).json({ success: false, message: "Token expired" });
    }

    const data = otpStore.get(payload.userId);
    if (!data || Date.now() > data.expiresAt) {
        otpStore.delete(payload.userId);
        return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (parseInt(otp) !== data.otp) {
        data.attempts++;
        if (data.attempts >= 3) {
            otpStore.delete(payload.userId);
            return res.status(429).json({ success: false, message: "Too many attempts" });
        }
        return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    otpStore.delete(payload.userId);

    
    if (payload.purpose === "RESET") {
        const resetToken = await new EncryptJWT({
            userId: payload.userId,
            purpose: "RESET"
        })
            .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
            .setExpirationTime("5m")
            .encrypt(SECRET_KEY);

        return res.json({ success: true, tempToken: resetToken, purpose: "RESET" });
    }

    req.db.execute(authQuery.getUserById, [payload.userId], async (err, result) => {
        if (err || result.length === 0) {
            return res.status(500).json({ success: false });
        }

        const role = result[0].role;

        const mainToken = await new EncryptJWT({
            userId: payload.userId,
            username: result[0].username,
            role,
            purpose: "AUTH"
        })
            .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
            .setExpirationTime("2h")
            .encrypt(SECRET_KEY);

        return res.json({
            success: true,
            mainToken,
            role,
            purpose: "LOGIN"
        });
    });
}

// forgot password
export async function forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email required" });
    }

    req.db.execute(authQuery.getUserByEmail, [email], async (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database error" });
        }
        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "Email not registered" });
        }

        const user = result[0];
        const otp = Math.floor(100000 + Math.random() * 900000);
        const tempToken = await new EncryptJWT({
            userId: user.userId,
            purpose: "RESET"
        })
            .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
            .setExpirationTime("5m")
            .encrypt(SECRET_KEY);

        otpStore.set(user.userId, { otp, attempts: 0, expiresAt: Date.now() + 5 * 60 * 1000 });

        await sendMail({ to: email, subject: "Reset Password OTP", text: `Your OTP is ${otp}` });

        return res.json({ success: true, message: "OTP sent for password reset", tempToken });
    });
}

//reset password
export async function resetPassword(req, res) {
    const { tempToken, newPassword, confirmPassword } = req.body;

    if (!tempToken || !newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "All fields required"
        });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Passwords do not match"
        });
    }

    let payload;
    try {
        ({ payload } = await jwtDecrypt(tempToken, SECRET_KEY));
    } catch {
        return res.status(400).json({
            success: false,
            message: "Invalid or expired token"
        });
    }

    if (payload.purpose !== "RESET") {
        return res.status(403).json({
            success: false,
            message: "Invalid reset token"
        });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    req.db.execute(
        authQuery.updatePasswordByUserId,
        [hashedPassword, payload.userId],
        (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Password update failed"
                });
            }

            return res.json({
                success: true,
                message: "Password reset successful"
            });
        }
    );
}





export function setUpAuthRoutes(app) {
    app.post("/api/signup", signUp);
    app.post("/api/login", login);
    app.post("/api/verifyOtp", verifyOtp);
    app.post("/api/forgotPassword", forgotPassword);
    app.put("/api/resetPassword", resetPassword);

}

export default { setUpAuthRoutes };
