/**
 * @desc user api
 * GET 使用req.params 来去到get过来的参数
 * POST 使用req
 * */
import { Router } from 'express'

const router = Router()

// Mock Users
const users = [
  { name: 'Alexandre' },
  { name: 'Pooya' },
  { name: 'Sébastien' }
]

// POST user login

router.post('/login', function (req, res, text) {

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
