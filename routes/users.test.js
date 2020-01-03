const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

const databaseName = 'test';
const user = 'root';
const pass = 'example';

const Users = require('../Models/Users');

const testDBInit = async () => {
  const url = `mongodb://${user}:${pass}@localhost/${databaseName}`;
  await mongoose.connect(url, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
    if (err) {
      process.exit(1);
    }
  });
  await Users.createCollection();
};

describe('Users Route', () => {
  let accessToken;
  beforeAll(testDBInit);

  it('create User with no parameters', async () => {
    const res = await request(app)
      .post('/users/signup');
    expect(res.statusCode).toEqual(400);
  });

  it('create User with one parameter', async () => {
    const res = await request(app)
      .post('/users/signup')
      .send({ username: 'john' });
    expect(res.statusCode).toEqual(400);
  });

  it('create User with two parameters', async () => {
    const res = await request(app)
      .post('/users/signup')
      .send({ username: 'john', email: 'john@gmail.com' });
    expect(res.statusCode).toEqual(400);
  });

  it('create User with correct parameters', async () => {
    const res = await request(app)
      .post('/users/signup')
      .send({ username: 'john', email: 'john@gmail.com', password: '12345678' });
    expect(res.statusCode).toEqual(200);
  });

  it('create User with duplicate username', async () => {
    const res = await request(app)
      .post('/users/signup')
      .send({ username: 'john', email: 'john@gmail.com', password: '12345678' });
    expect(res.statusCode).toEqual(401);
  });

  it('create User with DB issue', async () => {
    mongoose.connection.close();
    const res = await request(app)
      .post('/users/signup')
      .send({ username: 'john', email: 'john@gmail.com', password: '12345678' });
    expect(res.statusCode).toEqual(500);
    await testDBInit();
  });

  it('sign in with no parameters', async () => {
    const res = await request(app)
      .post('/users/signin');
    expect(res.statusCode).toEqual(400);
  });

  it('sign in with one parameter', async () => {
    const res = await request(app)
      .post('/users/signin')
      .send({ email: 'john@gmail.com' });
    expect(res.statusCode).toEqual(400);
  });

  it('sign in with correct parameters', async () => {
    const res = await request(app)
      .post('/users/signin')
      .send({ email: 'john@gmail.com', password: '12345678' });
    expect(res.statusCode).toEqual(200);
    accessToken = res.body.accessToken;
  });

  it('sign in with invalid user', async () => {
    const res = await request(app)
      .post('/users/signin')
      .send({ email: 'john2@gmail.com', password: '12345678' });
    expect(res.statusCode).toEqual(401);
  });

  it('sign in with wrong password', async () => {
    const res = await request(app)
      .post('/users/signin')
      .send({ email: 'john@gmail.com', password: '123' });
    expect(res.statusCode).toEqual(401);
  });

  it('sign in with DB issue', async () => {
    mongoose.connection.close();
    const res = await request(app)
      .post('/users/signin')
      .send({ email: 'john@gmail.com', password: '12345678' });
    expect(res.statusCode).toEqual(500);
    await testDBInit();
  });

  it('get user list without token', async () => {
    const res = await request(app)
      .get('/users');
    expect(res.statusCode).toEqual(401);
  });

  it('get user list with expired token', async () => {
    const expiredToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ijc4OSIsImVtYWlsIjoiNzg5QGdtYWlsLmNvbSIsImlhdCI6MTU3NzcwMDA2MiwiZXhwIjoxNTc3NzAzNjYyfQ.p3a41KIHC2GtTNchEdsSPwlz0xJIjm2YzZU7yVBmjhg';
    const res = await request(app)
      .get('/users')
      .set('Authorization', expiredToken);
    expect(res.statusCode).toEqual(500);
  });

  it('get user list without prefix', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .get('/users')
      .set('Authorization', token);
    expect(res.statusCode).toEqual(200);
    expect(res.body.userList.length).toEqual(1);
  });

  it('get user list without prefix', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .get('/users?prefix=john')
      .set('Authorization', token)
      .send({ prefix: 'john' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.userList.length).toEqual(1);
    expect(res.body.userList[0].username).toEqual('john');
  });

  it('get user with DB issue', async () => {
    mongoose.connection.close();
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .get('/users')
      .set('Authorization', token);
    expect(res.statusCode).toEqual(500);
    await testDBInit();
  });
});

afterAll(async () => {
  mongoose.connection.db.dropCollection('users', () => {});
  await mongoose.connection.close();
});
