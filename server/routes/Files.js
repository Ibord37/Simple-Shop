const FileRouter = require('express').Router();

const FileController = require('../controllers/FileController');

const Auth = require('../middlewares/auth');
const upload = require('../middlewares/multer');

FileRouter.post('/upload', Auth, upload.single('file'), FileController.Upload);
FileRouter.delete('/delete-file/:filename', Auth, FileController.Delete);

module.exports = FileRouter;