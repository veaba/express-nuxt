/**
 * @desc user api
 * GET 使用req.params 来去到get过来的参数
 * POST 使用req
 * */
import { Router } from 'express'
const Mongodb = require('mongodb').MongoClient // es 语法引入mongodb
const host = 'mongodb://localhost:27017'

const router = Router()

// Mock Users
const users = [
  { name: 'Alexandre' },
  { name: 'Pooya' },
  { name: 'Sébastien' }
]

// POST user login

router.post('/login', function (req, res, text) {
  Mongodb.connect(host, function (err, db) {
    if (err) {
      console.info(err)
    } else {
      // 数据库链接成功执行回掉
      console.info('~~~~~~~~~~链接成功~~~~~~~~~~')
    }
  })
  console.info(req.body)

  res.json({loginStatus: 'success'})
})

/* GET users listing. */
router.get('/users', function (req, res, next) {
  res.json(users)
})

/* GET user by ID. */
router.get('/users/:id', function (req, res, next) {
  console.info(req.params)
  const id = parseInt(req.params.id)
  if (id >= 0 && id < users.length) {
    res.json(users[id])
  } else {
    res.sendStatus(404)
  }
})

export default router
