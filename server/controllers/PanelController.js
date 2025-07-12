const StockController = require('../controllers/StockController');
const TransactionController = require('../controllers/TransactionController');

class PanelController {
    static async GetDashboard(req, res) {
        const networth = await StockController.EstimateNetworth();
        const item_count = await StockController.GetCount();
        const stock_count = await StockController.GetStockCount();
        const transaction_count = await TransactionController.GetCount();
        const items_sold = await TransactionController.EstimateSoldCount();
        const sales = await TransactionController.EstimateSales();
        const success_count = await TransactionController.GetByStatus('success') ?? 0;
        const failed_count = (await TransactionController.GetByStatus('failed')) ?? 0;
        const expired_count = (await TransactionController.GetByStatus('expired')) ?? 0;
        const pending_count = (await TransactionController.GetByStatus('pending')) ?? 0;

        return res.json({
            items_total: items_sold,
            stock_count,
            sales_total: sales,
            transaction_count,
            success_count,
            failed_count: failed_count + expired_count,
            pending_count,
            inv_items: item_count,
            networth: networth
        });
    }
}

module.exports = PanelController;