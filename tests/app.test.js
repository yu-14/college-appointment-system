const request = require('supertest');
const app = require('../app');
const { sequelize, User, Availability, Appointment } = require('../models/index');

describe('Appointment Flow', () => {
  let server;
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    server = app.listen(3000);
  });

  let studentToken, professorToken;

  test('Full User Flow', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        name: 'Student A1',
        email: 'a1@test.com',
        password: 'password',
        role: 'student'
      });

    await request(app)
      .post('/auth/register')
      .send({
        name: 'Professor P1',
        email: 'p1@test.com',
        password: 'password',
        role: 'professor'
      });

    const studentLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'a1@test.com', password: 'password' });
    studentToken = studentLogin.body.token;

    const professorLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'p1@test.com', password: 'password' });
    professorToken = professorLogin.body.token;

    const availabilityResponse = await request(app)
      .post('/availability')
      .set('Authorization', `Bearer ${professorToken}`)
      .send({
        startTime: '2024-01-01T09:00:00Z',
        endTime: '2024-01-01T10:00:00Z'
      });

    expect(availabilityResponse.statusCode).toBe(201);

    const bookResponse = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ availabilityId: availabilityResponse.body.id });

    if (bookResponse.status !== 201) {
      console.log('Booking failed with:', {
        status: bookResponse.status,
        body: bookResponse.body
      });
    }
    expect(bookResponse.status).toBe(201);

    const appointment = await Appointment.findOne({
      where: { availabilityId: availabilityResponse.body.id }
    });
    expect(appointment).toBeTruthy();

    const cancelResponse = await request(app)
      .delete(`/appointments/${appointment.id}`)
      .set('Authorization', `Bearer ${professorToken}`);
    expect(cancelResponse.status).toBe(200);
    expect(cancelResponse.body).toHaveProperty('message', 'Appointment cancelled successfully');
    const finalCheck = await request(app)
      .get('/appointments')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(finalCheck.status).toBe(200);
    expect(finalCheck.body).toEqual(expect.any(Array));
    expect(finalCheck.body.length).toBe(0);
  });

  afterAll(async () => {
    await server.close();
    await sequelize.close();
  });
});