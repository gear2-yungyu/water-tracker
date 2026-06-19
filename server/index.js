import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const app = express()
app.use(cors())
app.use(express.json())

const db = new DatabaseSync('water-tracker.db')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    cups INTEGER NOT NULL DEFAULT 0,
    coins INTEGER NOT NULL DEFAULT 0,
    shopLevel INTEGER NOT NULL DEFAULT 0
  )
`)

app.post('/api/signup', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: '아이디와 비밀번호를 입력하세요' })
  }
  const hash = bcrypt.hashSync(password, 10)
  try {
    const result = db
      .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
      .run(username, hash)
    res.json({ id: Number(result.lastInsertRowid), username })
  } catch {
    res.status(409).json({ error: '이미 존재하는 아이디예요' })
  }
})

app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: '아이디 또는 비밀번호가 틀렸어요' })
  }
  res.json({ id: user.id, username: user.username })
})

app.get('/api/state', (req, res) => {
  const userId = Number(req.query.userId)
  const row = db.prepare('SELECT cups, coins, shopLevel FROM users WHERE id = ?').get(userId)
  res.json(row)
})

app.post('/api/state', (req, res) => {
  const { userId, cups, coins, shopLevel } = req.body
  db.prepare('UPDATE users SET cups = ?, coins = ?, shopLevel = ? WHERE id = ?').run(cups, coins, shopLevel, userId)
  res.json({ cups, coins, shopLevel })
})

const distPath = path.join(import.meta.dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`)
})