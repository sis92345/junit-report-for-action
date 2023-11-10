/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import { run } from '../src/main'
import { testResultReaderBasedXml } from '../src/module/parser/testResultReader'
import { xmlTestParser } from '../src/module/parser/xmlTestParser'

// Other utilities
const timeRegex = /^\d{2}:\d{2}:\d{2}/

// Mock the GitHub Actions core library
let debugMock: jest.SpyInstance
let errorMock: jest.SpyInstance
let getInputMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance
let setOutputMock: jest.SpyInstance

const runMock = jest.spyOn(main, 'run')

describe('Action Integrated Test', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        debugMock = jest.spyOn(core, 'debug').mockImplementation()
        errorMock = jest.spyOn(core, 'error').mockImplementation()
        getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
        setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
        setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
    })

    it('status 개수대로 카운트되어 나온다. ', async () => {
        getInputMock.mockImplementation(
            (variableName: string) =>
                'actual-report-path/build/junit-test/test/TEST-*.xml'
        )

        jest.spyOn(
            testResultReaderBasedXml,
            'parseTestResult'
        ).mockImplementation((globPattern: string) => {
            return [
                {
                    cause: 'org.opentest4j.AssertionFailedError: &#10;expected: 1&#10; but was: 0',
                    name: 'failTest()',
                    status: 'failed'
                },
                {
                    cause: '',
                    name: 'successTest()',
                    status: 'passed'
                }
            ]
        })

        setOutputMock.mockImplementation((variable, value) => {
            if (variable === 'totalCount') {
                expect(value).toBe(2)
            } else if (variable === 'passed') {
                expect(value).toBe(1)
            } else if (variable === 'failed') {
                expect(value).toBe(1)
            } else if (variable === 'skipped') {
                expect(value).toBe(0)
            }
        })

        await run()
    })
})
