const { stock } = require('../models');
const { Op } = require('sequelize');

const fs = require('fs');

const LogController = require('./LogController');

class StockController {
    static GetCount() {
        return stock.count();
    }

    static async GetStockCount() {
        let x = 0;

        const data = await stock.findAll({
            attributes: ['item_quantity'],
            raw: true
        });

        data.forEach(item => {
            const qty = Number(item.item_quantity);

            if (qty !== -1)
                x += qty;
        });

        return x;
    }

    static async EstimateNetworth() {
        let result = 0;

        const data = await stock.findAll({
            attributes: ['sell_price', 'item_quantity', 'items_per_price'],
            raw: true
        });

        data.forEach(item => {
            const sell_price = Number(item.sell_price) || 0;
            const item_per_price = Number(item.items_per_price) || 1;
            const quantity = Number(item.item_quantity) || 0;

            // sample data:
            // quantity: 12, item_per_price: 5, sell_price: $200
            const full_groups = Math.floor(quantity / item_per_price); // floor(12 / 5) = 2
            const leftover = quantity % item_per_price; // 12 % 5 = 2
            const per_item_price = sell_price / item_per_price; // 200 / 5 = 40

            const fixed_price = (full_groups * sell_price) + (leftover * per_item_price); // 2 * 200 + 2 * 40

            if (quantity !== -1)
                result += fixed_price;
        });

        return result;
    }

    static async RestoreStock(item_id, items_list = []) {
        const stock_item = await stock.findByPk(item_id);
        const updated = [...stock_item.items_list, ...items_list];

        await stock_item.update({
            items_list: updated,
            item_quantity: updated.length
        });
    }

    static async RetrieveStock(item_id, amount = 1) {
        const stock_item = await stock.findByPk(item_id);
        if (!stock_item || !Array.isArray(stock_item.items_list) || stock_item.item_quantity < amount || amount < stock_item.items_per_price)
            return [];

        const items_list = [...stock_item.items_list];

        const popped = [];

        for (let i = 0; i < amount; i++) {
            const code = items_list.pop(); // get last item
            if (code)
                popped.push(code);
        }

        await stock_item.update({
            items_list,
            item_quantity: items_list.length
        });

        return popped;
    }

    static async Add(req, res) {
        let { item_name, /*item_quantity,*/ items_per_price, item_price, item_code, item_display, items_list } = req.body;
        const user = req.user;

        if (!item_display)
            return res.status(500).json({ message: "Image is invalid." });

        item_name = item_name.replace(/\s+/g, ' ').trim();
        item_display = item_display.toLowerCase();

        const qty = items_list.length;
        const price = +item_price;
        const item_per_price = +items_per_price;
        let success = false;

        const exist_name = await stock.findOne({
            where: {
                item_name: {
                    [Op.iLike]: item_name  // case-insensitive like
                }
            }
        });
        const exist_code = await stock.findOne({ where: { item_code } });

        if (!user || user.role < 2)
            return res.status(500).json({ message: "You're not allowed to do that." });
        if (exist_name)
            return res.status(500).json({ message: "Item with that name is already exist." });
        if (exist_code)
            return res.status(500).json({ message: "Item with that code is already exist, you can edit it instead of adding new one." });
        if (item_name.length < 3 || item_name.length > 20)
            return res.status(500).json({ message: "Item name must be in between 3-20 characters." });
        if (item_code.trim().length < 3)
            return res.status(500).json({ message: "Item code is too short." });
        if ((qty < 0 && qty !== -1) || isNaN(qty))
            return res.status(500).json({ message: "Item quantity can only be more than or equal to 0 or you can set the stock quantity to infinity by setting it to '-1'." });
        if (price <= 0 || isNaN(price))
            return res.status(500).json({ message: "Item price must be more than 0." });
        if (item_per_price <= 0 || isNaN(price))
            return res.status(500).json({ message: "Item per price must be more than 0." });
        if (qty < item_per_price && qty !== -1)
            return res.status(500).json({ message: "Item per price must be more than available stock." });
        if (!/\.(jpe?g|png)$/i.test(item_display))
            return res.status(400).json({ message: "Image is invalid or not supported." });

        try {
            await stock.create({
                item_name,
                item_quantity: qty,
                sell_price: price,
                item_code,
                items_per_price: item_per_price,
                item_display,
                items_list
            }).then(_ => {
                success = true;
            });

            await LogController.Add(user, `Add item to inventory. (Code: ${item_code})`, success);

            return res.json({ message: "Item has been added to inventory." });
        } catch (err) {
            console.log(err);
            await LogController.Add(user, `Add item to inventory. (Code: ${item_code})`, success);

            return res.status(500).json({ err });
        }
    }

    static async GetById(req, res) {
        const id = +req.params.id;
        const stocks = await stock.findByPk(id);

        return res.json({ item: stocks });
    }

    static async Get(req, res) {
        const { page, limit, search, by_name, empty_only, empty_also } = req.query;

        const stocks = await stock.findAll();

        try {
            const p = parseInt(page) || 1;
            const l = parseInt(limit) || 5;
            const s = search || '';
            const bn = by_name !== 'false';
            const eo = empty_only === 'true';

            //console.log(empty_only);

            const begin = (p - 1) * l;

            const filtered_stocks = stocks.filter(it => {
                const match_name = bn ? it.item_name.toLowerCase().includes(s.toLowerCase()) : it.item_code.toLowerCase().includes(s.toLowerCase());
                const empty = (it.item_quantity <= 0 && it.item_quantity !== -1);

                return eo ? match_name && empty : match_name;
            });
            const paginated_stocks = l === -1 ? filtered_stocks : filtered_stocks.slice(begin, begin + l);

            return res.json({
                page: p,
                limit: l,
                total: filtered_stocks.length,
                items: paginated_stocks
            });
        } catch (err) {
            return res.status(500).json({ message: err.message || "Internal server error" });
        }
    }

    static async Delete(req, res) {
        const id = +req.params.id;

        const user = req.user;
        const item = await stock.findOne({ where: { id } });

        if (!user || user.role < 2)
            return res.status(500).json({ message: "You're not allowed to do that." });

        if (!item)
            return res.status(500).json({ message: `Unable to find item with ID ${id}.` });

        const item_code = item.item_code;
        const item_display = item.item_display;

        try {
            const result = await stock.destroy({ where: { id } });
            const fixed_name = `./shop-icons/${item_display}`;

            fs.stat(fixed_name, function (err, stats) {
                // console.log(stats);//here we got all information of file in stats variable

                if (err)
                    console.error(err);

                fs.unlink(fixed_name, function (err) {
                    if (err)
                        console.log(err);

                    console.log('file deleted successfully');
                });
            });

            const success = result === 1;
            await LogController.Add(user, `Delete item from inventory. (Code: ${item_code}, Item ID: ${id})`, success);

            return res.json({ message: success ? "Delete success." : "Delete failed." });
        } catch (err) {
            console.log("Delete Error:", err);

            await LogController.Add(user, `Delete item from inventory. (Item ID: ${id})`, false);

            return res.status(500).json({ err });
        }
    }

    static async Update(req, res) {
        const id = +req.params.id;
        const user = req.user;

        //console.log(req.user);
        //console.log(req.cookies.token);

        let { item_name, /*item_quantity,*/ items_per_price, sell_price, item_code, item_display, items_list } = req.body;

        item_name = item_name.replace(/\s+/g, ' ').trim();

        if (!item_display)
            return res.status(500).json({ message: "Image is invalid." });

        item_display = item_display.toLowerCase();

        const qty = items_list.length;
        const price = +sell_price;
        const item_per_price = +items_per_price;

        const current_item = await stock.findByPk(id);
        if (!current_item)
            return res.status(404).json({ message: "Item not found." });
        if (!user)
            return res.status(403).json({ message: "You're not allowed to do that." });

        const exist_name = await stock.findOne({
            where: {
                item_name: {
                    [Op.iLike]: item_name
                },
                id: { [Op.ne]: id }
            }
        });
        const exist_code = await stock.findOne({ where: { item_code, id: { [Op.ne]: id } } });

        if (exist_name && item_name.toLowerCase() !== current_item.item_name.toLowerCase())
            return res.status(500).json({ message: "Item with that name is already exist." });
        if (exist_code)
            return res.status(500).json({ message: "Item with that code is already exist, you can edit it instead of adding new one." });
        if (item_name.length < 3 || item_name.length > 20)
            return res.status(500).json({ message: "Item name must be in between 3-20 characters." });
        if (item_code.trim().length < 3)
            return res.status(500).json({ message: "Item code is too short." });
        if ((qty < 0 && qty !== -1) || isNaN(qty))
            return res.status(500).json({ message: "Item quantity must be equal to or more than 0 or set -1 to make infinity." });
        if (price <= 0 || isNaN(price))
            return res.status(500).json({ message: "Item price must be more than 0." });
        if (item_per_price <= 0 || isNaN(item_per_price))
            return res.status(500).json({ message: "Item per price amount must be more than 0." });
        if (qty < item_per_price && qty !== -1)
            return res.status(500).json({ message: "Item per price must be more than available stock." });
        if (!/\.(jpe?g|png)$/i.test(item_display))
            return res.status(400).json({ message: "Image is invalid or not supported." });

        if (req.file) {
            if (current_item.item_display) {
                const fixed_name = path.join(__dirname, 'shop-icons', current_item.item_display);
                fs.stat(fixed_name, function (err, stats) {

                    if (err)
                        console.error(err);

                    fs.unlink(fixed_name, function (err) {
                        if (err)
                            console.log(err);

                        console.log('file deleted successfully');
                    });
                });
            }
        }

        try {
            stock.update({
                item_name,
                item_quantity: qty,
                sell_price: price,
                item_code,
                items_per_price: item_per_price,
                item_display,
                items_list
            }, {
                where: { id }
            }).then(async (_) => {
                await LogController.Add(user, `Update inventory item. (Code: ${item_code}, Item ID: ${id})`, true);
                return res.json({ message: "Item has been modified." });
            }).catch(async (err) => {
                console.log(err);
                await LogController.Add(user, `Update inventory item. (Code: ${item_code}, Item ID: ${id})`, false);
                return res.status(500).json({ err });
            });
        } catch (_) {
            console.log(err);
            await LogController.Add(user, `Update inventory item. (Code: ${item_code}, Item ID: ${id})`, false);
            return res.status(500).json({ err });
        }
    }
}

module.exports = StockController;