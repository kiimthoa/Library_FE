//định nghĩa lớp trợ giúp kết nối đến mng
const {MongoClient} = require("mongodb"); // lấy đối tượng mongoclient từ lib mongo

class MongoDB {
    static connect = async (uri) => { // phương thức async kết nối đến mongodb
        if(this.client) return this.client; // nếu atr client đã tồn tại thì trả về k cần nối kết mới
        this.client = await MongoClient.connect(uri); // nếu chưa connect thì gọi method connect của obj để connect
        return this.client;
    };

}

module.exports = MongoDB;