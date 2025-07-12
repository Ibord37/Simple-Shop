const path = require('path');
const fs = require('fs');

class FileController {
    static Upload(req, res) {
        if (!req.file)
            return res.status(400).send('No file uploaded.');

        return res.json({ fileUrl: req.file.filename });
    }

    static async Delete(req, res) {
        const { filename } = req.params;
        console.log(filename);

        const allowed_ext = ['.jpg', '.jpeg', '.png'];
        const ext = path.extname(filename).toLowerCase();

        if (!allowed_ext.includes(ext))
            return res.status(400).json({ message: 'Invalid file type.' });

        const file_path = path.join(__dirname, '../shop-icons', path.basename(filename));
        console.log(file_path);

        try {
            await fs.promises.unlink(file_path);
            return res.json({ message: "Success." });
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.warn("File already deleted or missing:", file_path);
                return res.json({ message: "File did not exist, treated as deleted." });
            } else {
                // Other errors (e.g., permission issues)
                console.error("Error deleting file:", err);
                return res.status(500).json({ message: "Failed to delete file." });
            }
        }
    }
}

module.exports = FileController;