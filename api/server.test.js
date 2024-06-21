// Write your tests here
const request = require('supertest')
const server = require('./server')
const db = require('../data/dbConfig')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

beforeEach(async () => {
  await db('users').truncate()
})

afterAll(async () => {
  await db.destroy()
})

describe('Auth Endpoints', () => {
  it('[POST] /api/auth/register - registers a user', async () => {
    const res = await request(server).post('/api/auth/register').send({ username: 'test', password: '1234' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
  })

  it('[POST] /api/auth/login - logs in a user', async () => {
    await request(server).post('/api/auth/register').send({ username: 'test', password: '1234' })
    const res = await request(server).post('/api/auth/login').send({ username: 'test', password: '1234' })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  it('[POST] /api/auth/register - fails if username already exists', async () => {
    await request(server).post('/api/auth/register').send({ username: 'test', password: '1234' })
    const res = await request(server).post('/api/auth/register').send({ username: 'test', password: '1234' })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('username taken')
  })

  it('[POST] /api/auth/register - fails if username or password is missing', async () => {
    const res = await request(server).post('/api/auth/register').send({ username: '' })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('username and password required')
  })

  it('[POST] /api/auth/login - fails if username does not exist', async () => {
    const res = await request(server).post('/api/auth/login').send({ username: 'nonexistent', password: '1234' })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('invalid credentials')
  })

  it('[POST] /api/auth/login - fails if password is incorrect', async () => {
    await request(server).post('/api/auth/register').send({ username: 'test', password: '1234' })
    const res = await request(server).post('/api/auth/login').send({ username: 'test', password: 'wrong' })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('invalid credentials')
  })
})

describe('Jokes Endpoints', () => {
  it('[GET] /api/jokes - fails if token is missing', async () => {
    const res = await request(server).get('/api/jokes')
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('token required')
  })

  it('[GET] /api/jokes - fails if token is invalid', async () => {
    const res = await request(server).get('/api/jokes').set('Authorization', 'invalidtoken');
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('token invalid')
  })

  it('[GET] /api/jokes - succeeds with valid token', async () => {
    await request(server).post('/api/auth/register').send({ username: 'test', password: '1234' })
    const loginRes = await request(server).post('/api/auth/login').send({ username: 'test', password: '1234' })
    const res = await request(server).get('/api/jokes').set('Authorization', loginRes.body.token)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(3)
  })
})

