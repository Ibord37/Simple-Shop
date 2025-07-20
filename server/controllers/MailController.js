const { users, Mail, user_mail } = require('../models');
const { Op } = require('sequelize');

class MailController {
    static async GetById(req, res) {
        const session_user = req.user;

        const mail_id = +req.params.id;
        const mail = await Mail.findByPk(mail_id);

        let access = await user_mail.findOne({ where: { mail_id, user_id: session_user.id } });

        if (!session_user)
            return res.status(403).json({ message: "Unauthorized." });

        if (mail.is_broadcast)
            return res.json({ mail });

        if (session_user.role >= 2 && !access)
            access = await user_mail.findOne({ where: { mail_id } });

        if (!access)
            return res.status(404).json({ message: "Oops... Unable to find that mail." });

        await access.update({ is_read: true });

        console.log(mail);
        console.log(mail_id);

        return res.json({ mail });
    }
    static async GetUserMails(req, res) {
        const session_user = req.user;

        if (!session_user)
            return res.status(403).json({ message: "Unauthorized." });

        const user_id = session_user.id;

        // Retrieve all existing mails with user_id from user_mail database, then get the content from Mail database
        const user_mails = await user_mail.findAll({ attributes: ['mail_id'], where: { user_id } });
        const mail_ids = user_mails.map((user_mail) => user_mail.mail_id);

        const mails = await Mail.findAll({
            where: { id: { [Op.in]: mail_ids } },
            order: [['createdAt', 'DESC']]
        });
        // return the content, sender (format: Name (@username)), createdAt, and title
        return res.json({ mails });
    }

    static async SendToUser(req, res) {
        let { recipient_user, title, content } = req.body;
        const session_user = req.user;

        try {
            if (!session_user)
                return res.status(403).json({ message: "Unauthorized." });

            recipient_user = recipient_user.replace(/[^\S\r\n]+/g, ' ').trim();
            title = title.replace(/[^\S\r\n]+/g, ' ').trim();
            content = content.replace(/[^\S\r\n]+/g, ' ').trim();

            if (title.length < 5 || title.length > 25)
                return res.status(500).json({ message: "Title must be between 5-25 characters." });
            if (content.length < 10)
                return res.status(500).json({ message: "Content must be between at least 10 characters." });

            const recipient = await users.findOne({ where: { username: { [Op.iLike]: recipient_user } } });

            if (!recipient)
                return res.status(404).json({ message: "Unable to track the recipient." });

            const mail = await Mail.create({ title, content, is_broadcast: false, sender: `${session_user.name} (@${session_user.username})` });

            await user_mail.create({ user_id: recipient.id, mail_id: mail.id });
            return res.json({ message: `You have successfully sent your mail to @${recipient.username}.` });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ err });
        }
    }

    static async SendNotification(uid, title, content) {
        try {
            const recipient = await users.findByPk(+uid);

            if (!recipient)
                return res.status(404).json({ message: "Unable to track the recipient." });

            const mail = await Mail.create({ title, content, is_broadcast: false, sender: "Administrator (@System)" });

            await user_mail.create({ user_id: recipient.id, mail_id: mail.id });
        } catch (err) {
            console.error(err);
        }
    }

    static async SendBroadcast(req, res) {
        let { title, content } = req.body;

        const session_user = req.user;
        if (!session_user || session_user.role < 2)
            return res.status(403).json({ message: "Unauthorized." });

        try {
            title = title.replace(/[^\S\r\n]+/g, ' ').trim();
            content = content.replace(/[^\S\r\n]+/g, ' ').trim();
            
            if (title.length < 5 || title.length > 25)
                return res.status(500).json({ message: "Title must be between 5-25 characters." });
            if (content.length < 10 || title.length > 128)
                return res.status(500).json({ message: "Content must be between 10-128 characters." });

            const mail = await Mail.create({ title, content, is_broadcast: true, sender: `Administrator (@${session_user.username})` });
            const user_list = await users.findAll({ attributes: ['id'] });

            const UserMails = user_list.map((user) => ({
                user_id: user.id,
                mail_id: mail.id
            }));

            await user_mail.bulkCreate(UserMails);
            return res.json({ message: "Broadcast has been sent to all users." });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ err });
        }
    }
}

module.exports = MailController;