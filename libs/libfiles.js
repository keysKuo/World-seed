const fs = require("fs")
const pathapi = require('path');
exports.move = (oldpath, newpath, callback) => {
    // Read the file
    fs.readFile(oldpath, function (err, data) {
        if (err)
            return callback(err);
        // Write the file
        fs.writeFile(newpath, data, function (err) {
            callback(err)
        });

        // Delete the file
        fs.unlink(oldpath, function (err) {
            //if (err) throw err; không xét lỗi xóa
            console.log('File deleted!');
        });
    });
}
exports.writefile = (path, text, callback)=>{
    fs.writeFile(path, text, function (err) {
        callback(err)
    });
}
exports.read_text = (filetxt, callback) => {
    // Read the file
    fs.readFile(filetxt, function (err, data) {
        if (err)
            return callback("");
        callback(data)
    });
}
exports.list_dir = (dir, extensions, callback) => {
    fs.readdir(dir, (err, files) => {
        file_filtered = []
        files.forEach(file => {
            let ext = file.indexOf(".") >= 0 ? file.split(".")[1].toLowerCase() : ""
            //nếu có yêu cầu lấy phần mở rộng cụ thể thì chỉ lấy những file thỏa
            if (extensions) {
                if (extensions.find(s => s.toLowerCase() == ext))
                    file_filtered.push({ path: pathapi.join(dir, file), name: file })
            }
            else
                file_filtered.push({ path: pathapi.join(dir, file), name: file })
            //console.log({path:dir + '/' + file, name: file});
        });
        callback(file_filtered)
    });
}
exports.isexist = (path) => {
    try {
        if (fs.existsSync(path)) {
            return true
        }
    } catch (err) {
    }
    return false
}