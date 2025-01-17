import User from "../models/user.model.js"

export const createUserController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ e: "All fields are required" });
        }
        const hashedPassword = await User.hashPassword(password);
        const user = await User.create({
            email,
            password: hashedPassword
        });
        delete user._doc.password;
        return res.status(200).json({ m: "user registered", o: user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ e: "Internal server error" });
    }
};

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ e: "All fields are required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ e: "User not found" });
        }
        const isValid = await user.isValidPassword(password);
        if (!isValid) {
            return res.status(400).json({ e: "Invalid credentials" });
        }
        const token = user.generateJWT();
        res.cookie('token', token, { httpOnly: true });
        delete user._doc.password;
        return res.status(200).json({ m: "User logged in", o: user, token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ e: "Internal server error" });
    }
};

export const userProfile = async (req, res) => {
    try {
        return res.status(200).json({ m: "User profile", o: req.user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ e: "Internal server error" });
    }
};

export const userLogout = async (req, res) => {
    try {
        res.cookie("token", "");
        return res.status(200).json({ m: "User logged out" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ e: "Internal server error" });
    }
};