const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// REGISTER USER
router.post("/register", async (req, res) => {
    try {
        const { fullName, mobile, email, book, password } = req.body;

        // Check that all fields were provided
        if (!fullName || !mobile || !email || !book || !password) {
            return res.status(400).json({
                message: "Please fill in all fields."
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "An account with this email already exists."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            fullName,
            mobile,
            email,
            book,
            password: hashedPassword
        });

        // Log the new user in straight away
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "Account created successfully!",
            token: token,
            user: {
                id: user._id,
                fullName: user.fullName,
                mobile: user.mobile,
                email: user.email,
                book: user.book
            }
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        res.status(500).json({
            message: "Server error during registration."
        });
    }
});

// ===============================
// LOGIN USER
// ===============================
router.post("/login", async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Check that both fields were provided
        if (!identifier || !password) {
            return res.status(400).json({
                message: "Please enter your email/phone number and password."
            });
        }

        // Find user by email or mobile number
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { mobile: identifier }
            ]
        });

        // User not found
        if (!user) {
            return res.status(401).json({
                message: "Invalid email, phone number or password."
            });
        }

        // Compare entered password with hashed password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email, phone number or password."
            });
        }

        // Create login token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Send successful login response
        res.json({
            message: "Login successful!",
            token: token,
            user: {
                id: user._id,
                fullName: user.fullName,
                mobile: user.mobile,
                email: user.email,
                book: user.book
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Server error during login."
        });
    }
});
module.exports = router;