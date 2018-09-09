/***********************
 * @name JS
 * @author Jo.gel
 * @date 9/9/2018
 ***********************/
import {Router} from 'express'
import _user from '../controllers/users' // 用户相关操作函数
const router = Router()

// Mock Users
const users = [
  { name: 'Alexandre' },
  { name: 'Pooya' },
  { name: 'Sébastien' }
]

router.get('/getUser', _user.getUser)

/* GET user by ID. */
router.get('/users/:id', function (req, res, next) {
  const id = parseInt(req.params.id)
  if (id >= 0 && id < users.length) {
    res.json(users[id])
  } else {
    res.sendStatus(404)
  }
})

export default router
// module.exports = router
