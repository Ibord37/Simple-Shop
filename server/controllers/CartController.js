const { users, stock, sequelize } = require('../models');

class CartController {
    static async Add(req, res) {
        let { item_id, item_count } = req.body;

        const req_user = req.user;
        if (!req_user)
            return res.status(403).json({ message: "Unauthorized." });

        const user = await users.findByPk(req_user.id);
        if (!user)
            return res.status(403).json({ message: "Please create an account first." });

        item_id = +item_id;
        item_count = +item_count;

        const item = await stock.findByPk(item_id);
        if (!item)
            return res.status(500).json({ message: "Item does not exist." });

        if (item_count <= 0 || isNaN(item_count) || (item.item_quantity !== -1 && item_count > item.item_quantity) || item_count < item.items_per_price)
            return res.status(500).json({ message: "Item count must be higher than minimum." });

        const cart = Array.isArray(user.cart) ? JSON.parse(JSON.stringify(user.cart)) : [];
        const existing = cart.find(items => items.item_id === item.id);

        if (existing) {
            existing.item_count = item_count;
            if (existing.item_count > item.item_quantity && item.item_quantity !== -1)
                existing.item_count = item.item_quantity;
            if (existing.item_count <= 0)
                cart.splice(cart.indexOf(existing), 1); // remove if zero
        } else {
            cart.push({
                item_id: item.id,
                item_count
            });
        }

        await user.update({ cart: [...cart] });
        return res.status(200).json({ message: "Success." });
    }

    static async Delete(req, res) {
        const id = +req.params.id;
        const req_user = req.user;
        if (!req_user)
            return res.status(403).json({ message: "Unauthorized." });

        const user = await users.findByPk(req_user.id);
        if (!user)
            return res.status(403).json({ message: "Please create an account first." });

        let cart = Array.isArray(user.cart) ? JSON.parse(JSON.stringify(user.cart)) : [];
        cart = cart.filter(i => i.item_id !== id);

        await user.update({ cart: [...cart] });
        return res.json({ cart });
    }

    static async Get(req, res) {
        const req_user = req.user;
        if (!req_user)
            return res.status(403).json({ message: "Unauthorized." });

        const user = await users.findByPk(req_user.id);
        if (!user)
            return res.status(403).json({ message: "Please create an account first." });

        return res.json({ cart: user.cart });
    }
}

module.exports = CartController;