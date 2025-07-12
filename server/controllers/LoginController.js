const { ActionRowBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');
//const pool = require('../DatabasePool');

const { Op } = require('sequelize'); // Import Op for OR operator

const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv').config();

const { users, RefreshToken } = require('../models');

let client;

class LoginController {
    static SetClient(_client) {
        client = _client;
    }
    static async HandleRefresh(req, res) {
        const token = req.cookies.refresh_token;
        if (!token)
            return res.status(401).json({ message: "Missing refresh token" });

        // Find refresh token in DB
        const stored = await RefreshToken.findOne({ where: { refresh_token: token, revoked: false } });

        if (!stored || +new Date(stored.expires_at) < Date.now()) {
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }

        const user = await user.findByPk(stored.user_id);
        if (!user)
            return res.status(403).json({ message: "User not found" });

        const user_data = {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.admin_level,
            verified: user.verified,
            discord_id: user.discord_id
        }

        const accessToken = jwt.sign(
            user_data,
            process.env.JWT_KEY,
            { expiresIn: '8h' }
        );

        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 8 * 60 * 60 * 1000
        });

        return res.json({ message: "Token refreshed" });
    }
    static async VerifyLogin(req, res) {
        let { username, password } = req.body;

        console.log(username);
        console.log(password);

        username = username.trim().toLowerCase();
        password = password.trim();

        const user = await users.findOne({
            where: {
                username: {
                    [Op.iLike]: username
                }
            }
        });

        if (!user)
            return res.status(500).json({ message: "Username or password could be wrong." });

        try {
            const match_pass = await argon2.verify(user.password, password);
            if (user.username.toLowerCase() === username && match_pass) {
                const user_data = {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    role: user.admin_level,
                    verified: user.verified,
                    discord_id: user.discord_id
                }

                const token = jwt.sign(user_data, process.env.JWT_KEY, { expiresIn: '8h' });

                const refresh_token = crypto.randomBytes(64).toString('hex');
                const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

                await RefreshToken.create({
                    refresh_token,
                    revoked: false,
                    expires_at,
                    user_id: user.id,
                });

                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 8 * 60 * 60 * 1000
                });

                res.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000
                });

                //console.log(user_data);

                return res.json({ message: "Login success.", user: user_data });
            } else {
                return res.status(500).json({ message: "Username or password could be wrong." });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Account name or password could be wrong." });
        }
    }

    static async Register(req, res) {
        let { name, username, password, verify_password, discord_id } = req.body;

        const HasSpecial = (text) => {
            return /[^a-zA-Z0-9]/.test(text);
        };

        name = name.replace(/\s+/g, ' ').trim();
        username = username.replace(/\s+/g, ' ').trim();
        password = password.trim();
        verify_password = verify_password.trim();
        discord_id = discord_id.trim();

        try {
            const existing_user = await users.findOne({
                where: {
                    [Op.or]: [
                        { username: { [Op.iLike]: username } },
                        { discord_id: discord_id }
                    ],

                }
            });

            if (existing_user) {
                if (existing_user.username === username)
                    return res.status(403).json({ message: "Username has been taken by other before." });

                if (existing_user.discord_id === discord_id)
                    return res.status(403).json({ message: "This Discord ID has been used by another account." });

                return res.status(403).json({ message: "An account with this name or Discord ID already exists." });
            }

            if (username.trim().length < 3 || username.trim().length > 18 || HasSpecial(username))
                return res.status(403).json({ message: "Username must consist of 3-18 characters with no special character." });

            if (name.trim() === '')
                return res.status(403).json({ message: "Name cannot be empty." });

            if (password.length < 3 || password.length > 18)
                return res.status(403).json({ message: "Password must consist of 3-18 characters." });

            if (password !== verify_password)
                return res.status(403).json({ message: "Passwords are mismatching!" });

            try {
                const password_hash = await argon2.hash(password);
                const user = await client.users.fetch(discord_id);

                const confirm = new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Verify')
                    .setStyle(ButtonStyle.Success);

                const row = new ActionRowBuilder();

                row.addComponents(confirm);
                await user.send({ content: `Account with username **${username}** has just registered with this Discord ID. Click verify if it is you.`, components: [row] });

                await users.create({
                    name,
                    username,
                    password: password_hash,
                    admin_level: 0,
                    discord_id,
                    verified: false,
                });

                /*
                await pool.query(`INSERT INTO users (name, password, admin_level, discord_id, verified, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
                    [name, password_hash, 0, discord_id, false]
                );
                */

                return res.status(200).json({ message: "Successfully created new account." });
            } catch (err) {
                console.error(err);
                return res.status(403).json({ message: "The discord bot has failed to reach you. This could happen when you didn't share the same server with the bot, wrong ID, or you closed dms." });
            }
        } catch (err) {
            console.error(err);
            return res.status(403).json({ message: "test" });
        }
    }
}

module.exports = LoginController;