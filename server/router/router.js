/***********************
 * @name JS
 * @author Jo.gel
 * @date 9/9/2018
 ***********************/
const {Router} = require('express')
const router = Router()

// Mock Users
const users = [
  { name: 'Alexandre' },
  { name: 'Pooya' },
  { name: 'Sébastien' }
]

router.get('/getUser', function (req, res, next) {
  res.send('getUser')
})
router.get('/test', function (req, res, next) {
  res.send('test')
})
router.get('/test/test', function (req, res, next) {
  res.send('/test/test')
})
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
module.exports = router
