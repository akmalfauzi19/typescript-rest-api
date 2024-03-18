import supertest from "supertest";
import { web } from "../src/application/web";
import { logger } from "../src/application/logging";
import { UserTest } from "./test-util";
import bcrypt from 'bcrypt'

describe('POST /api/users', () => {

    afterEach(async () => {
        await UserTest.delete();
    })

    it('should reject register new user if request is invalid', async () => {
        const res = await supertest(web).post('/api/users')
            .send({
                username: "",
                password: "",
                name: ""
            })

        logger.debug(res.body);
        expect(res.status).toBe(400)
        expect(res.body.errors).toBeDefined()
    });

    it('should register new user', async () => {
        const res = await supertest(web)
            .post('/api/users')
            .send({
                username: "test",
                password: "test",
                name: "test name"
            });

        logger.debug(res.body);
        expect(res.status).toBe(200)
        expect(res.body.data.username).toBe('test')
        expect(res.body.data.name).toBe('test name')
    });
});

describe('POST /api/users/login', () => {
    beforeEach(async () => {
        await UserTest.create();
    })

    afterEach(async () => {
        await UserTest.delete();
    })

    it('should be able to login', async () => {
        const res = await supertest(web)
            .post('/api/users/login')
            .send({
                username: 'test',
                password: 'test'
            })

        logger.debug(res.body);
        expect(res.status).toBe(200);
        expect(res.body.data.username).toBe('test');
        expect(res.body.data.name).toBe('test');
        expect(res.body.data.token).toBeDefined();

    });
    it('should reject login user if username is wrong', async () => {
        const res = await supertest(web)
            .post('/api/users/login')
            .send({
                username: 'wrong',
                password: 'test'
            })

        logger.debug(res.body);
        expect(res.status).toBe(401);
        expect(res.body.errors).toBeDefined();

    });
    it('should reject login user if password is wrong', async () => {
        const res = await supertest(web)
            .post('/api/users/login')
            .send({
                username: 'test',
                password: 'wrong'
            })

        logger.debug(res.body);
        expect(res.status).toBe(401);
        expect(res.body.errors).toBeDefined();

    });
});

describe('GET /api/users/current', () => {
    beforeEach(async () => {
        await UserTest.create();
    })

    afterEach(async () => {
        await UserTest.delete();
    })

    it('should be able to get user', async () => {
        const res = await supertest(web)
            .get('/api/users/current')
            .set('X-API-TOKEN', 'test');

        logger.debug(res.body);
        expect(res.status).toBe(200);
        expect(res.body.data.username).toBe('test');
        expect(res.body.data.name).toBe('test');
    });
})

describe('PATCH /api/users/current', () => {
    beforeEach(async () => {
        await UserTest.create();
    })

    afterEach(async () => {
        await UserTest.delete();
    })

    it('should reject update user if request is invalid', async () => {
        const res = await supertest(web)
            .patch('/api/users/current')
            .set('X-API-TOKEN', 'test')
            .send({
                password: '',
                name: ''
            });

        logger.debug(res.body);
        expect(res.status).toBe(400)
        expect(res.body.errors).toBeDefined();
    });
    it('should reject update user if token is wrong', async () => {
        const res = await supertest(web)
            .patch('/api/users/current')
            .set('X-API-TOKEN', 'salah')
            .send({
                password: 'benar',
                name: 'benar'
            });

        logger.debug(res.body);
        expect(res.status).toBe(401)
        expect(res.body.errors).toBeDefined();
    });
    it('should be able to update user name', async () => {
        const res = await supertest(web)
            .patch('/api/users/current')
            .set('X-API-TOKEN', 'test')
            .send({
                name: 'benar'
            });

        logger.debug(res.body);
        expect(res.status).toBe(200)
        expect(res.body.data.name).toBe('benar');
    });
    it('should be able to update user password', async () => {
        const res = await supertest(web)
            .patch('/api/users/current')
            .set('X-API-TOKEN', 'test')
            .send({
                password: 'benar'
            });

        logger.debug(res.body);
        expect(res.status).toBe(200);

        const user = await UserTest.get();

        expect(await bcrypt.compare('benar', user.password)).toBe(true);
    });
});

describe('DELETE /api/users/current', () => {
    beforeEach(async () => {
        await UserTest.create();
    })

    afterEach(async () => {
        await UserTest.delete();
    })

    it('should be able to logout', async () => {
        const res = await supertest(web)
            .delete('/api/users/current')
            .set('X-API-TOKEN', 'test')

        logger.debug(res.body);
        expect(res.status).toBe(200);
        expect(res.body.data).toBe('OK');

        const user = await UserTest.get();
        expect(user.token).toBeNull();
    });
    it('should reject logout user if token is wrong', async () => {
        const res = await supertest(web)
            .delete('/api/users/current')
            .set('X-API-TOKEN', 'salah')

        logger.debug(res.body);
        expect(res.status).toBe(401);
        expect(res.body.errors).toBeDefined();
    });
})
