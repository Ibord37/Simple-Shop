const { users, stock } = require('../models');

class UserController {
    static async GetExtendedData(req, res) {
        const user_ = req.user;
        if (!user_)
            return res.status(403).json({ message: "Unauthorized." });

        const user = await users.findByPk(user_.id);
        if (!user)
            return res.status(403).json({ message: "Unauthorized." });

        const user_data = {
            balance: user.balance,
            inventory: user.inventory
        };

        return res.status(200).json({ user_db: user_data });
    }

    static async AddInventoryItem(user, item_id, items_list = []) {
        if (!user)
            return false;

        const inv = Array.isArray(user.inventory) ? [...user.inventory] : [];
        const existing_index = inv.findIndex(items => items.item_id === item_id);

        const item = await stock.findByPk(item_id);

        if (!item)
            return false;

        if (!Array.isArray(items_list) || items_list.length === 0)
            return false;

        if (existing_index !== -1) {
            const existing = inv[existing_index];

            const append_item = [...existing.items_list, ...items_list];
            const updated = {
                //...existing,
                item_id: existing.item_id,
                items_list: append_item,
                item_count: append_item.length
            }

            //console.log(append_item.length);
            //console.log(updated.item_count);

            // if (updated.item_count > item.item_quantity && item.item_quantity > 0)
            //     updated.item_count = item.item_quantity;

            inv[existing_index] = updated;
        } else {
            const item_count = items_list.length;

            inv.push({
                item_id,
                item_count,
                items_list
            });
        }

        user.inventory = inv;

        //await user.update({ inventory: [...inv] });
        return true;
    }
}

module.exports = UserController;