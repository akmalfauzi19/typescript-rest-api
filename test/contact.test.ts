import supertest from "supertest";
import { ContactTest, UserTest } from "./test-util"
import { web } from "../src/application/web";
import { logger } from "../src/application/logging";

describe('POST /api/contacts', () => {

    beforeEach(async () => {
        await UserTest.create();
    })

    afterEach(async () => {
        await ContactTest.deleteAll();
        await UserTest.delete();
    })

    it('should create new contact', async () => {
        const response = await supertest(web)
            .post('/api/contacts')
            .set('X-API-TOKEN', 'test')
            .send({
                first_name: 'akmal',
                last_name: 'fauzi',
                email: 'akmalfauzi@gmail.com',
                phone: "123456"
            })

        logger.debug(response.body);
        expect(response.status).toBe(200);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.first_name).toBe('akmal');
        expect(response.body.data.last_name).toBe('fauzi')
        expect(response.body.data.email).toBe('akmalfauzi@gmail.com');
        expect(response.body.data.phone).toBe('123456');

    });
    it('should reject create new contact if data is invalid', async () => {
        const response = await supertest(web)
            .post('/api/contacts')
            .set('X-API-TOKEN', 'test')
            .send({
                first_name: '',
                last_name: '',
                email: 'akmalfauzi@gmail.com',
                phone: "12345611111111111111"
            })

        logger.debug(response.body);
        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    });
})