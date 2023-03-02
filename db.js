const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

mongoose.connect('mongodb://localhost:27017/express-auth')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    set(val) {
      // 使用 bcrypt 加密密码
      return bcrypt.hashSync(val, 10)
    }
  },
})

const UserModel = mongoose.model('User', UserSchema)

module.exports = {
  UserModel
}