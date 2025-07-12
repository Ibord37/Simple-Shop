const { logs } = require('../models');

class LogController {
    static async Get(req, res) {
        const { page, limit, search, date } = req.query;

        const user_logs = await logs.findAll();

        try {
            const p = parseInt(page) || 1;
            const l = parseInt(limit) || 5;
            const s = search || '';

            const begin = (p - 1) * l;

            const filtered_logs = user_logs.filter(it => {
                const match_detail = it.details.toLowerCase().includes(s.toLowerCase());
                const match_date = new Date(it.time).toISOString().slice(0, 10) === date;

                return date ? match_detail && match_date : match_detail;
            });
            const paginated_logs = filtered_logs.slice(begin, begin + l);

            return res.json({
                page: p,
                limit: l,
                total: filtered_logs.length,
                logs: paginated_logs
            });
        } catch (err) {
            return res.status(500).json({ message: err.message || "Internal server error" });
        }
    }

    static async Add(issuer, details, success) {
        const issuer_id = issuer.id;
        const issuer_name = issuer.username;

        await logs.create({
            issuer_id,
            issuer_name,
            details,
            time: Date.now(),
            success
        });
    }
}

module.exports = LogController;