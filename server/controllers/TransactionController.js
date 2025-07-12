const { Op } = require('sequelize');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const { transaction, users, stock, sequelize } = require('../models');
const { FormatNumber } = require('../utils/Text');

const UserController = require('./UserController');
const StockController = require('./StockController');

let client;

class TransactionController {
    static SetClient(client_) {
        client = client_;
    }
    static async Get(req, res) {
        const { page, limit, search, date } = req.query;
        const user = req.user;

        if (!user)
            return res.status(403).json({ message: "Unauthorized." });

        const transactions = await transaction.findAll({ order: [[
            sequelize.literal(`
            CASE status
                WHEN 'pending' THEN 1
                WHEN 'success' THEN 2
                WHEN 'failed' THEN 3
                WHEN 'expired' THEN 4
                ELSE 5
            END
        `), 'ASC']] });

        try {
            const p = parseInt(page) || 1;
            const l = parseInt(limit) || 5;
            const s = search || '';

            const begin = (p - 1) * l;
            const now = Date.now();

            for (const transaction of transactions) {
                if (transaction.expiresAt < now && transaction.status.toLowerCase() === 'pending') {
                    transaction.status = "expired";
                    await transaction.save();
                }
            }

            const filtered_transactions = transactions.filter(it => {
                const details = `${it.issuer} ${it.type?.toLowerCase()} ${it.items} for $${FormatNumber(it.price)}.`;
                const match_detail = details.toLowerCase().includes(s.toLowerCase());
                const match_date = new Date(it.createdAt).toISOString().slice(0, 10) === date;

                return date ? match_detail && match_date : match_detail;
            });
            const paginated_transactions = l === -1 ? filtered_transactions : filtered_transactions.slice(begin, begin + l);

            return res.json({
                page: p,
                limit: l,
                total: filtered_transactions.length,
                transactions: paginated_transactions
            });
        } catch (err) {
            return res.status(500).json({ message: err.message || "Internal server error" });
        }
    }

    static async FindOne(req, res) {
        const { date } = req.query;

        const user = req.user;
        if (!user)
            return res.status(403).json({ message: "Unauthorized." });

        let issuer = user.username;

        const transactions = await transaction.findAll({ order: [[
            sequelize.literal(`
            CASE status
                WHEN 'pending' THEN 1
                WHEN 'success' THEN 2
                WHEN 'failed' THEN 3
                WHEN 'expired' THEN 4
                ELSE 5
            END
        `), 'ASC']], where: { issuer: { [Op.iLike]: issuer } } });
        const now = Date.now();

        for (const transaction of transactions) {
            if (transaction.expiresAt < now && transaction.status.toLowerCase() === 'pending') {
                transaction.status = "expired";
                await transaction.save();
            }
        }

        const filtered_transactions = transactions.filter(it => {
            const match_date = new Date(it.createdAt).toISOString().slice(0, 10) === date;

            return date ? match_date : true;
        });

        return res.json({ transactions: filtered_transactions });
    }

    static async Add(req, res) {
        const { option, actual_price } = req.body;
        const added_price = parseInt(actual_price) || -1;

        try {
            const user_ = req.user;
            if (!user_)
                return res.status(403).json({ message: "Unauthorized." });

            const supported_options = ['untitled_coin', 'discord', 'discord-topup'];
            if (!supported_options.includes(option))
                return res.status(500).json({ message: "Unsupported payment method." });

            const type = option === "discord-topup" ? "Recharge" : "Purchase";

            let issuer = user_.username;
            const Cleanup = (text) => text.replace(/\s+/g, ' ').trim();

            issuer = Cleanup(issuer);
            //code = Cleanup(code);

            const user = await users.findOne({ where: { username: issuer } });

            let items = [];
            let price = 0;

            if (!user)
                return res.status(404).json({ message: "User does not exist." });

            if (added_price === -1) {
                if (user.cart.length === 0)
                    return res.status(500).json({ message: "Your cart is empty." });

                for (const cart of user.cart) {
                    const { item_id, item_count } = cart;
                    const item = await stock.findByPk(item_id);

                    const retrieved = await StockController.RetrieveStock(item_id, item_count);

                    if (item_count <= 0)
                        continue;

                    if (retrieved.length < item_count) {
                        for (const reserved of items)
                            await StockController.RestoreStock(reserved.item_id, reserved.items_list);

                        return res.status(500).json({ message: "Not enough stock for that item." });
                    }

                    //items.push(`x${item_count} ${item.item_name} (${item.item_code})`);
                    items.push({ item_type: "voucher", item_id, item_count, items_list: retrieved });
                    price += item_count * item.sell_price;
                }
            } else {
                if (added_price < 100)
                    return res.status(500).json({ message: "You must at least top up $100." });

                price = added_price;
                items.push({ item_type: "coin", item_id: null, item_count: added_price });
            }

            //const details = `purchases ${items.join(', ')} for $${FormatNumber(price)}.`;

            await transaction.create({
                type,
                items: JSON.stringify(items),
                //items: items.join(", "),
                status: "pending",
                payment: option === "discord-topup" ? "discord" : option,
                issuer,
                price,
                expiresAt: new Date(Date.now() + 300000) // 5 mins
            });

            await user.update({ cart: [] });

            return res.status(200).json({ message: "Transaction has been made." });
        } catch (err) {
            console.error(err);
            return res.send(err);
        }
    }

    static async Pay(req, res) {
        const t = await sequelize.transaction();

        const transaction_id = +req.params.transaction_id;
        const session_user = req.user;

        if (!session_user)
            return res.status(403).json({ message: "Unauthorized." });

        const user = await users.findByPk(session_user.id);
        const transactions = await transaction.findByPk(transaction_id);

        const now = Date.now();

        if (!transactions || transactions.expiresAt < now || transactions.status !== "pending")
            return res.status(500).json({ message: "This transaction does not exist or already expired." });

        if (!user || user.username.toLowerCase() !== transactions.issuer.toLowerCase())
            return res.status(500).json({ message: "You don't have access to this transaction." });

        try {
            switch (transactions.payment) {
                case "untitled_coin":
                    if (transactions.price > user.balance)
                        return res.status(500).json({ message: "You don't have enough balance to do that." });

                    user.balance -= transactions.price;
                    for (const entry of transactions.items)
                        await UserController.AddInventoryItem(user, entry.item_id, entry.items_list);

                    transactions.status = "success";

                    await transactions.save({ transactions: t });
                    await user.save({ transactions: t });

                    await t.commit();

                    return res.status(200).json({ message: "Thanks for purchasing from us." });
                case "discord":
                    const discord_user = await client.users.fetch(user.discord_id);
                    const button_name = transactions.type === "Recharge" ? "topup" : "payment";
                    const confirm = new ButtonBuilder()
                        .setCustomId(`confirm-${button_name}_${transactions.id}`)
                        .setLabel('Verify')
                        .setStyle(ButtonStyle.Success);

                    const row = new ActionRowBuilder();
                    row.addComponents(confirm);

                    await discord_user.send({ content: `You're attempting to pay your transaction bill (ID: #${transactions.id}) (Amount: **$${FormatNumber(transactions.price)}**). Please confirm by clicking 'Verify' button.`, components: [row] });

                    return res.status(200).json({ message: "Payment confirmation has been sent to your discord." });
                default:
                    return res.status(500).json({ message: "Unsupported payment method." });
            }
        } catch (err) {
            console.error(err);
            await t.rollback();

            return res.status(500).json({ err });
        }
    }

    static async EstimateSales() {
        const transactions = await transaction.findAll({
            attributes: ['price'],
            where: { status: 'success' },
            raw: true
        });
        let ret = 0;

        transactions.forEach(x => {
            ret += x.price;
        });

        return ret;
    }

    static async EstimateSoldCount() {
        const transactions = await transaction.findAll({
            attributes: ['items'],
            where: { status: 'success' },
            raw: true
        });
        let ret = 0;

        transactions.forEach(x => {
            let items = [];

            try {
                items = typeof x.items === 'string' ? JSON.parse(x.items) : x.items;
            } catch (e) {
                console.warn('Invalid JSON in items field:', x.items);
            }

            for (const item of items) {
                const { item_type, item_count } = item;
                
                if (item_type === "voucher")
                    ret += item_count || 0;
            }
        });

        return ret;
    }

    static async GetByStatus(status) {
        const transactions = await transaction.findAll({ where: { status } });
        return transactions?.length;
    }

    static GetCount() {
        return transaction.count();
    }
}

module.exports = TransactionController;