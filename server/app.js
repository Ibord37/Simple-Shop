const { Client, Events, GatewayIntentBits } = require('discord.js');

const cors = require('cors');
const cookie_parser = require('cookie-parser');
const dotenv = require('dotenv');
const express = require('express');
const { Op } = require('sequelize');

const LoginRouter = require('./routes/Login');
const LogoutRouter = require('./routes/Logout');
const PanelRouter = require('./routes/Panel');
const FileRouter = require('./routes/Files');
const UserRouter = require('./routes/User');

const { users, transaction, sequelize } = require('./models');
const pool = require('./database/DatabasePool');

const LoginController = require('./controllers/LoginController');
const TransactionController = require('./controllers/TransactionController');
const UserController = require('./controllers/UserController');
const StockController = require('./controllers/StockController');
const MailController = require('./controllers/MailController');

const { FormatNumber, HumanizeTimestamp, CapitalizeFront } = require('./utils/Text');

const app = express();
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers
	]
});

const port = 1337;
const beta_test = false;
const offline = false;

dotenv.config();

app.use(cookie_parser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/shop-icons', express.static('shop-icons'));

const allowedOrigins = [
	'http://localhost:3000',
	'http://192.168.1.6:3000',
	'http://ftbot.local:3000'
];

app.use(cors({
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true
}));

if (!beta_test) {
	app.use((req, res, next) => {
		const origin = req.headers.origin;
		if (origin && !allowedOrigins.includes(origin)) {
			return res.status(403).json({ message: 'Forbidden origin' });
		}
		next();
	});
}

// Discord Events
client.once(Events.ClientReady, async readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	try {
		const invite = await client.generateInvite({
			scopes: ['bot', 'applications.commands'],
			permissions: [
				'SendMessages',
				'ManageMessages',
				'ViewChannel',
				'ReadMessageHistory'
			]
		});

		console.log(`Generated invite link: ${invite}`);
	} catch (err) {
		console.error(err);
	}

	LoginController.SetClient(client);
	TransactionController.SetClient(client);
});

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isButton()) {
		const [custom_id, transaction_id] = interaction.customId.split('_');
		switch (custom_id) {
			case "confirm": {
				const result = await pool.query(`UPDATE users SET verified = true WHERE discord_id = $1 AND verified = false RETURNING *`, [interaction.user.id]);
				if (result.rowCount === 0)
					return interaction.reply("User not found or already updated.");

				return interaction.reply("Verification successful! You can now login with your account.");
			}
			case "confirm-payment": {
				const discord_id = interaction.user.id;
				const t = await sequelize.transaction();

				//const discord_user = await discord_users.findOne({ where: { user_id: discord_id } });
				const user = await users.findOne({ where: { discord_id } });
				const transactions = await transaction.findByPk(+transaction_id);

				const now = Date.now();

				if (!transactions || transactions?.issuer?.toLowerCase() !== user?.username?.toLowerCase())
					return interaction.reply("This transaction is not available for you.");

				if (transactions.expiresAt < now || transactions.status !== "pending")
					return interaction.reply("This transaction is already expired.");

				if (!user)
					return interaction.reply("You are not registered in the website.");

				if (user.discord_balance < transactions.price)
					return interaction.reply("You don't have enough balance to do that.");

				try {
					user.discord_balance -= transactions.price;
					for (const entry of transactions.items)
						await UserController.AddInventoryItem(user, entry.item_id, entry.items_list);

					transactions.status = "success";

					await transactions.save({ transactions: t });
					await user.save({ transactions: t });

					await t.commit();
					return interaction.reply("Payment successful! Thanks for purchasing from us.");
				} catch (err) {
					console.error(err);

					await t.rollback();
					return interaction.reply("Payment failed! Restoring data...");
				}
			}
			case "confirm-topup": {
				const discord_id = interaction.user.id;

				//const discord_user = await discord_users.findOne({ where: { user_id: discord_id } });
				const user = await users.findOne({ where: { discord_id } });
				const transactions = await transaction.findByPk(+transaction_id);

				const now = Date.now();

				if (!transactions || transactions?.issuer?.toLowerCase() !== user?.username?.toLowerCase())
					return interaction.reply("This transaction is not available for you.");

				if (transactions.expiresAt < now || transactions.status !== "pending")
					return interaction.reply("This transaction is already expired.");

				if (!user)
					return interaction.reply("You are not registered in the website.");

				if (user.discord_balance < transactions.price)
					return interaction.reply("You don't have enough balance to do that.");

				const title = "Top Up Notification";
				const content = `**Thanks for trusting our service.**\n
					**${FormatNumber(transactions.price)} Untitled Coins** has been sent to your account.

					Payment Method: ${CapitalizeFront(transactions.payment)}
					Paid at: ${HumanizeTimestamp(now)}

					*This is an auto-generated message.*
				`;

				user.discord_balance -= transactions.price;
				user.balance += transactions.price;

				transactions.status = "success";

				await user.save();
				await transactions.save();

				await MailController.SendNotification(user.id, title, content);

				return interaction.reply("Payment successful! Thanks for purchasing from us.");
			}
			default: {
				return interaction.reply(`${interaction.customId} is not a button.`);
			}
		}
	}
});

app.use('/api/', LoginRouter);
app.use('/api/', LogoutRouter);
app.use('/api/', PanelRouter);
app.use('/api/', FileRouter);
app.use('/api/', UserRouter);

app.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});

async function CleanupTransactions() {
	const expired = await transaction.findAll({
		where: {
			status: "pending",
			expiresAt: { [Op.lt]: Date.now() }
		}
	});

	for (const trx of expired) {
		for (const item of trx.items) {
			if (item.item_type === "voucher")
				await StockController.RestoreStock(item.item_id, item.items_list);
		}

		trx.status = "failed";
		await trx.save();
	}
}

setInterval(async () => {
	await CleanupTransactions();
}, 60 * 1000);

if (!offline)
	client.login(process.env.BOT_TOKEN);