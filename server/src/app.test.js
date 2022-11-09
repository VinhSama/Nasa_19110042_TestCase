const supertest = require('supertest');
const app = require('./app');

const fs = require('fs');
const path = require('path');
const data = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf-8');

describe("Test Case for path '/planets'", () => {
    test("GET    - '/planets' - Successful", async () => {
        const response = await supertest(app).get('/planets');
        expect(response.header['content-type']).toMatch(/json/);
        expect(response.status).toBe(200);
    });
});

describe("Test Case for path '/launches'", () => {
    test("GET    - '/launches' - Successful", async () => {
        const response = await supertest(app).get('/launches');
        expect(response.header['content-type']).toMatch(/json/);
        expect(response.status).toBe(200);
        expect(JSON.parse(response.text).length).toBe(1);
        expect(JSON.parse(response.text)[0].flightNumber).toBe(100);
    });

    test("POST   - '/launches' - Successful", async () => {
        const response = await supertest(app).post('/launches').send({
            mission: 'Kepler Exploration X',
            rocket: 'Explorer IS1',
            launchDate: new Date('November 11, 2025'),
            target: 'Kepler-442 b',
            customer: ['ZTM', 'NASA'],
            upcoming: true,
            success: true
        });
        expect(response.header['content-type']).toMatch(/json/);
        expect(response.status).toBe(201);
        expect(JSON.parse(response.text).flightNumber).toBe(101);
    });
    test("POST   - '/launches' - Failed (missing require)", async () => {
        const launches = [
            {
                rocket: 'Explorer IS1',
                launchDate: new Date('November 11, 2025'),
                target: 'Kepler-442 b',
                customer: ['ZTM', 'NASA'],
                upcoming: true,
                success: true
            },
            {
                mission: 'Kepler Exploration X',
                launchDate: new Date('November 11, 2025'),
                target: 'Kepler-442 b',
                customer: ['ZTM', 'NASA'],
                upcoming: true,
                success: true
            },
            {
                mission: 'Kepler Exploration X',
                rocket: 'Explorer IS1',
                target: 'Kepler-442 b',
                customer: ['ZTM', 'NASA'],
                upcoming: true,
                success: true
            },
            {
                mission: 'Kepler Exploration X',
                rocket: 'Explorer IS1',
                launchDate: new Date('November 11, 2025'),
                customer: ['ZTM', 'NASA'],
                upcoming: true,
                success: true
            },
            {
                customer: ['ZTM', 'NASA'],
                upcoming: true,
                success: true
            },
        ]

        for (const launch of launches) {
            const response = await supertest(app).post('/launches').send(launch);
            expect(response.header['content-type']).toMatch(/json/);
            expect(response.status).toBe(400);
            expect(response.text).toBe('{"error":"Missing required launch property"}');
        }
    });
    test("POST   - '/launches' - Failed (invalid date)", async () => {
        const response = await supertest(app).post('/launches').send({
            mission: 'Kepler Exploration X',
            rocket: 'Explorer IS1',
            launchDate: 'November 50, 2025',
            target: 'Kepler-442 b',
            customer: ['ZTM', 'NASA'],
            upcoming: true,
            success: true
        });
        expect(response.header['content-type']).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.text).toBe('{"error":"Invalid launch date"}');
    });

    test("DELETE - '/launches/:id' - Successful", async () => {
        const response = await supertest(app).delete('/launches/100');
        expect(response.header['content-type']).toMatch(/json/);
        expect(response.status).toBe(200);
        expect(JSON.parse(response.text).upcoming).toBe(false);
        expect(JSON.parse(response.text).success).toBe(false);
    });
    test("DELETE - '/launches/:id' - Failed (not found)", async () => {
        const response = await supertest(app).delete('/launches/19110042');
        expect(response.header['content-type']).toMatch(/json/);
        expect(response.status).toBe(404);
        expect(response.text).toBe('{"error":"Launch not found"}');
    });
});

describe("Test Case for path '/*'", () => {
    test("GET    - '/' - Successful", async () => {
        const response = await supertest(app).get('/');
        expect(response.header['content-type']).toMatch(/text/);
        expect(response.status).toBe(200);
        expect(response.text).toBe(data);
    });
    test("GET    - '/NguyenQuangVinh-19110042' - Successful", async () => {
        const response = await supertest(app).get('/NguyenQuangVinh-19110042');
        expect(response.header['content-type']).toMatch(/text/);
        expect(response.status).toBe(200);
        expect(response.text).toBe(data);
    });
});