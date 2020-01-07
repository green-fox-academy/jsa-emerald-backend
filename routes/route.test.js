const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
require('dotenv').config();

const Users = require('../Models/Users');
const Families = require('../Models/Families');

let accessToken;
let mikeID;
const expiredToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ijc4OSIsImVtYWlsIjoiNzg5QGdtYWlsLmNvbSIsImlhdCI6MTU3NzcwMDA2MiwiZXhwIjoxNTc3NzAzNjYyfQ.p3a41KIHC2GtTNchEdsSPwlz0xJIjm2YzZU7yVBmjhg';

const testDBInit = async () => {
  const url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@localhost/${process.env.DB_DATABASE}`;
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,

  }, (err) => {
    if (err) {
      process.exit(1);
    }
  });
  await Users.createCollection();
  await Families.createCollection();
};

beforeAll(testDBInit);

afterAll(async () => {
  mongoose.connection.db.dropCollection('users', () => {});
  mongoose.connection.db.dropCollection('families', () => {});
  await mongoose.connection.close();
});

describe('Users Route', () => {
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

  it('create another User', async () => {
    const res = await request(app)
      .post('/users/signup')
      .send({ username: 'mike', email: 'mike@gmail.com', password: '12345678' });
    expect(res.statusCode).toEqual(200);
  });

  it('create User with duplicate username', async () => {
    const res = await request(app)
      .post('/users/signup')
      .send({ username: 'john', email: 'john@gmail.com', password: '12345678' });
    expect(res.statusCode).toEqual(401);
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

  it('sign in another user', async () => {
    const res = await request(app)
      .post('/users/signin')
      .send({ email: 'mike@gmail.com', password: '12345678' });
    expect(res.statusCode).toEqual(200);
    mikeID = jwt.verify(res.body.accessToken, process.env.JWT_SECRET).id;
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

  it('get user list without token', async () => {
    const res = await request(app)
      .get('/users');
    expect(res.statusCode).toEqual(401);
  });

  it('get user list with expired token', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', expiredToken);
    expect(res.statusCode).toEqual(401);
  });

  it('get user list without prefix', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .get('/users')
      .set('Authorization', token);
    expect(res.statusCode).toEqual(200);
    expect(res.body.userList.length).toEqual(2);
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

  it('create User with DB issue', async () => {
    mongoose.connection.close(true);
    const res = await request(app)
      .post('/users/signup')
      .send({ username: 'john', email: 'john@gmail.com', password: '12345678' });
    expect(res.statusCode).toEqual(500);
    await testDBInit();
  });

  it('sign in with DB issue', async () => {
    mongoose.connection.close(true);
    const res = await request(app)
      .post('/users/signin')
      .send({ email: 'john@gmail.com', password: '12345678' });
    expect(res.statusCode).toEqual(500);
    await testDBInit();
  });

  it('get user with DB issue', async () => {
    mongoose.connection.close(true);
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .get('/users')
      .set('Authorization', token);
    expect(res.statusCode).toEqual(500);
    await testDBInit();
  });
});

describe('Users Route', () => {
  it('GET Not Found Page', async () => {
    const res = await request(app)
      .get('/NOT/EXITS');
    expect(res.statusCode).toEqual(404);
  });

  it('POST Not Found Page', async () => {
    const res = await request(app)
      .post('/NOT/EXITS');
    expect(res.statusCode).toEqual(404);
  });

  it('Heartbeat Test Failed', async () => {
    mongoose.connection.close();
    const res = await request(app)
      .get('/heartbeat');
    expect(res.statusCode).toEqual(500);
    await testDBInit();
  });

  it('Heartbeat Test Correct', async () => {
    const res = await request(app)
      .get('/heartbeat');
    expect(res.statusCode).toEqual(200);
  });

  it('Get Family Transaction', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .get('/family-transactions')
      .set('Authorization', token);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(0);
  });

  it('Family Formation without parameter', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .post('/family')
      .set('Authorization', token);
    expect(res.statusCode).toEqual(400);
  });

  it('Family Formation with empty parameter', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .post('/family')
      .set('Authorization', token)
      .send({ members: '' });
    expect(res.statusCode).toEqual(400);
  });

  it('Family Formation with invalid members', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .post('/family')
      .set('Authorization', token)
      .send({ members: '123,123' });
    expect(res.statusCode).toEqual(400);
  });

  it('Family Formation with invalid member', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .post('/family')
      .set('Authorization', token)
      .send({ members: '507f1f77bcf86cd799439011,507f1f77bcf86cd799439011' });
    expect(res.statusCode).toEqual(400);
  });

  it('Family Formation with DB issue', async () => {
    setTimeout(async () => {
      mongoose.connection.close(true);
      const token = `Bearer ${accessToken}`;
      const res = await request(app)
        .post('/family')
        .set('Authorization', token)
        .send({ members: mikeID });
      expect(res.statusCode).toEqual(500);
      await testDBInit();
    }, 500);
  });

  it('Family Formation Success', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .post('/family')
      .set('Authorization', token)
      .send({ members: mikeID });
    expect(res.statusCode).toEqual(200);
  });

  it('Family Transaction Creation without token', async () => {
    const res = await request(app)
      .post('/family-transactions');
    expect(res.statusCode).toEqual(401);
  });

  it('Family Transaction Creation with expired token', async () => {
    const res = await request(app)
      .post('/family-transactions')
      .set('Authorization', expiredToken);
    expect(res.statusCode).toEqual(401);
  });

  it('Family Transaction Creation without parameter', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .post('/family-transactions')
      .set('Authorization', token);
    expect(res.statusCode).toEqual(400);
  });

  it('Family Transaction Creation with invalid parameter i', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .post('/family-transactions')
      .set('Authorization', token)
      .send({ amount: 100 });
    expect(res.statusCode).toEqual(400);
  });

  it('Family Transaction Creation with invalid parameter ii', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .post('/family-transactions')
      .set('Authorization', token)
      .send({ amount: 100, labelName: 'weChat' });
    expect(res.statusCode).toEqual(400);
  });

  it('Family Transaction Creation with invalid parameter iii', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .post('/family-transactions')
      .set('Authorization', token)
      .send({ amount: 100, labelName: 'weChat', date: 543567 });
    expect(res.statusCode).toEqual(400);
  });

  it('Family Transaction Creation with valid parameters', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .post('/family-transactions')
      .set('Authorization', token)
      .send({
        amount: 100, labelName: 'weChat', date: 543567, type: 'Expense',
      });
    expect(res.statusCode).toEqual(200);
  });

  it('Family Transaction Creation with DB issue', async () => {
    setTimeout(async () => {
      mongoose.connection.close(true);
      const token = `Bearer ${accessToken}`;
      const res = await request(app)
        .post('/family-transactions')
        .set('Authorization', token)
        .send({
          amount: 100, labelName: 'weChat', date: 543567, type: 'Expense',
        });
      expect(res.statusCode).toEqual(200);
      await testDBInit();
    }, 500);
  });

  it('Get Family Transaction without token', async () => {
    const res = await request(app)
      .get('/family-transactions');
    expect(res.statusCode).toEqual(401);
  });

  it('Get Family Transaction with expired token', async () => {
    const res = await request(app)
      .get('/family-transactions')
      .set('Authorization', expiredToken);
    expect(res.statusCode).toEqual(401);
  });

  it('Get Family Transaction', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .get('/family-transactions')
      .set('Authorization', token);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
  });

  it('Get Family Transaction with DB issue', async () => {
    setTimeout(async () => {
      mongoose.connection.close(true);
      const token = `Bearer ${accessToken}`;
      const res = await request(app)
        .get('/family-transactions')
        .set('Authorization', token);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      await testDBInit();
    }, 1000);
  });

  it('Restore without token', async () => {
    const res = await request(app)
      .get('/backup');
    expect(res.statusCode).toEqual(401);
  });

  it('Restore with expired token', async () => {
    const res = await request(app)
      .get('/backup')
      .set('Authorization', expiredToken);
    expect(res.statusCode).toEqual(401);
  });

  it('Restore with valid user', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .get('/backup')
      .set('Authorization', token);
    expect(res.statusCode).toEqual(200);
  });

  it('Backup without token', async () => {
    const res = await request(app)
      .post('/backup');
    expect(res.statusCode).toEqual(401);
  });

  it('Backup with expired token', async () => {
    const res = await request(app)
      .post('/backup')
      .set('Authorization', expiredToken);
    expect(res.statusCode).toEqual(401);
  });

  it('Backup without parameter', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .post('/backup')
      .set('Authorization', token);
    expect(res.statusCode).toEqual(400);
  });

  it('Backup with good parameter', async () => {
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .post('/backup')
      .set('Authorization', token)
      .send({ transactions: 'dummy' });
    expect(res.statusCode).toEqual(200);
  });

  it('Backup with DB issue', async () => {
    mongoose.connection.close(true);
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .post('/backup')
      .set('Authorization', token)
      .send({ transactions: 'dummy' });
    expect(res.statusCode).toEqual(500);
    await testDBInit();
  });

  it('Restore with DB issue', async () => {
    mongoose.connection.close(true);
    const token = `Bearer ${accessToken}`;
    const res = await request(app)
      .get('/backup')
      .set('Authorization', token);
    expect(res.statusCode).toEqual(500);
    await testDBInit();
  });
});
