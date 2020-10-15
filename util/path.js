const path = require('path');

exports.path = path.dirname(require.main.filename);

exports.parseUploadedFileName = originalFileName => {
    const dateRegex = /^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d:\d\d:\d\d.\d\d\d)Z$/.exec(new Date().toISOString());

    let fileName = originalFileName;
    let fileExt = '';
    const fileRegex = /^(.*)\.(\w*)$/.exec(fileName);

    if (fileRegex != null) {
        fileName = fileRegex[1] ? fileRegex[1] : 'noname';

        if (fileRegex[2]) {
            fileExt = `.${fileRegex[2]}`;
        }
    }

    return `${fileName}_-_${dateRegex[1]}-${dateRegex[2]}-${dateRegex[3]}_${dateRegex[4].replace('.', '-').replace(/:/g, '.')}${fileExt}`;
};