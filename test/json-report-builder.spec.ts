import { afterEach, afterAll, describe, expect, test } from "bun:test";
import { JsonReportBuilder } from "..";
import type { Report } from "@dragee-io/asserter-type";
import { unlinkSync, rmdirSync } from "node:fs"

const expectedResultDir = 'test/expected-result/';
const testResultDir = 'test/test-result/';
const testResultFile = testResultDir + 'testreport';

afterEach(() => {
    // Delete test file
    unlinkSync(testResultFile + '.json');
})

afterAll(() => {
    // Delete test directory
    rmdirSync(testResultDir);
})

describe('JsonReportBuilder', () => {
    test('JSON with no report', async () => {
        const reports: Report[] = [];
        await JsonReportBuilder.buildReports(reports, testResultFile);

        const createdReport = await Promise.resolve(Bun.file(testResultFile + '.json').text());
        expect(createdReport).toEqual("[]");  
    });
    
    test('JSON with multiple reports with no errors', async () => {
        const reports: Report[] = [{
            errors: [],
            namespace: "ddd",
            pass: true,
            stats: {
                rulesCount: 7,
                errorsCount: 0,
                passCount: 7
            }
        },{
            errors: [],
            namespace: "test",
            pass: true,
            stats: {
                rulesCount: 5,
                errorsCount: 0,
                passCount: 5
            }
        }];
        await JsonReportBuilder.buildReports(reports, testResultFile);

        const createdReport = await Promise.resolve(Bun.file(testResultFile + '.json').text());
        expect(createdReport).toEqual("[]");
    });

    
    test('JSON with multiple reports with errors', async () => {
        const reports: Report[] = [{
            errors: [
                'The aggregate "io.dragee.rules.relation.DrageeOne" must at least contain a "ddd/entity" type dragee',
                'The aggregate "io.dragee.rules.relation.DrageeTwo" must at least contain a "ddd/entity" type dragee'
            ],
            namespace: "ddd",
            pass: true,
            stats: {
                rulesCount: 7,
                errorsCount: 2,
                passCount: 5
            }
        },{
            errors: ["Test error"],
            namespace: "test",
            pass: true,
            stats: {
                rulesCount: 5,
                errorsCount: 1,
                passCount: 4
            }
        }];
        await JsonReportBuilder.buildReports(reports, testResultFile);

        const createdReport = await Promise.resolve(Bun.file(testResultFile + '.json').text());
        const expectedReport = await Promise.resolve(Bun.file(expectedResultDir + 'testreport.json').text());

        expect(createdReport).toEqual(expectedReport);  
    });
})