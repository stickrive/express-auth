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
  // 获取请求头中的 authorization
  const raw = String(authorization).split(' ').pop()
  // jwt.verify() 验证 token
  jwt.verify(raw, SECRET, async (err, decoded) => {
    if (err) {
      req.data = {
        message: '请先登录！',
      }
    } else {
      const { id } = decoded
      req.data = await UserModel.findById(id)
    }
    next()
  });
}

app.get('/api/info', authMiddle, async(req, res) => {
  res.send(req.data)
})

app.listen(3000, () => {
  console.log(`http://localhost:3000`)
})