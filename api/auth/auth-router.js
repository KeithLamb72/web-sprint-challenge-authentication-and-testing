const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Users = require('../users/users-model')

const JWT_SECRET = process.env.JWT_SECRET || 'shh'

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" })
    }
    const existingUser = await Users.findBy({ username }).first()
    if (existingUser) {
      return res.status(400).json({ message: "username taken" })
    }
    const hash = bcrypt.hashSync(password, 8) // 2^8 rounds of hashing
    const newUser = await Users.add({ username, password: hash })
    res.status(201).json(newUser)
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" })
    }
    const user = await Users.findBy({ username }).first()
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "invalid credentials" })
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' })
    res.status(200).json({ message: `welcome, ${user.username}`, token })
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message })
  }
})

module.exports = router;
