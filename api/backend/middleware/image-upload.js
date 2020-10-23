const path = require('path');

const { deleteFile } = require('../util/file');

exports.putImage = (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Not authenticated');
    }
    if (!req.file) {
        return res.status(200).json({ message: 'No file provided!' });
    }
    if (req.body.oldPath) {
        deleteFile(path.join('images', req.body.oldPath));
    }
    return res.status(201).json({ message: 'File stored.', filePath: req.file.filename });
};