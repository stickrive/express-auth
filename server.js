const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const SECRET = 'expressbcryptjwt'

const { UserModel } = require('./db')

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/users',  async (req, res) => {
  const list = await UserModel.find()
  res.send(list)
})

app.post('/api/register', async(req, res) => {
  const { username, password } = req.body

  const user = await UserModel.create({
    username,
    password,
  })
  res.send(user)
})

app.post('/api/login', async(req, res) => {
  const { username, password } = req.body
  const user = await UserModel.findOne({
    username
  })
  // 如果用户不存在
  if (!user) {
    return res.send({
      message: '账号或密码错误！',
    })
  }
  // 如果用户存在，验证密码是否正确
  const isPasswordValid = bcrypt.compareSync(password, user.password)
  if(!isPasswordValid) {
    return res.status(422).send({
      message: '账号或密码错误！',
    })
  }
  // 生成 token
  const token = jwt.sign({
    id: String(user._id)
  }, SECRET)

  res.send({
    user,
    token,
  })
})

// 验证 token 中间件
const authMiddle = async(req, res, next) => {
  const { authorization } = req.headers
  const raw = String(authorization).split(' ').pop()
  // 获取请求头中的 authorization
  const { id } = jwt.verify(raw, SECRET)
  // 解密 token
  req.user = await UserModel.findById(id)
  // 根据 id 查询用户
  next()
}

app.get('/api/info', authMiddle, async(req, res) => {
  res.send(req.user)
})

app.listen(3000, () => {
  console.log(`http://localhost:3000`)
})