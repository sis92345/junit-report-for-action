/**
 *
 * <pre>
 *     Test Result Parser
 *      - 목적 : 테스트 결과 파일 (xml, json..)을 읽어서 단일 테스트 결과 JSON으로 반환시킵니다. -> Action 기반
 * </pre>
 * */
import { XMLParser } from 'fast-xml-parser'
import path from 'path'
import fs from 'fs'
import * as core from '@actions/core'
import * as globLib from 'glob'

const junitXmlSample =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<testsuite name="com.gradle.example.AppTest" tests="2" skipped="0" failures="1" errors="0" timestamp="2023-11-08T10:46:53" hostname="hosthost" time="0.01">\n' +
    '  <properties/>\n' +
    '  <testcase name="failTest()" classname="com.gradle.example.AppTest" time="0.009">\n' +
    '    <failure message="org.opentest4j.AssertionFailedError: App Test is Faliing" type="org.opentest4j.AssertionFailedError">' +
    'callstack-test' +
    '    </failure>' +
    '</testcase>' +
    '<testcase name="appHasAGreeting()" classname="com.gradle.example.AppTest" time="0.001"/>' +
    '</testsuite>'

/**
 * Mock fs
 * */
const readFileSyncMock = jest
    .fn()
    .mockImplementation((path: string, option: string) => {
        return junitXmlSample
    })

/**
 * Mock glob
 * */
jest.spyOn(globLib, 'glob').mockImplementation(pattern => {
    return Promise.resolve([
        path.resolve(__dirname, 'app_test_one.xml'),
        path.resolve(__dirname, 'app_test_two.xml')
    ])
})
/**
 * Mock actions/core
 * */
const getInputMock = () => {
    return jest
        .spyOn(core, 'getInput')
        .mockImplementation((variable: string) => {
            return `?_${variable}`
        })
}

const getWarningMock = () => {
    return jest.spyOn(core, 'warning').mockImplementation(message => {
        console.log(message)
    })
}

const setFailMock = () => {
    return jest.spyOn(core, 'setFailed').mockImplementation(message => {
        console.log(message)
    })
}

describe('Test Result에서 다양한 Format의 데이터를 읽는다.', () => {
    it('Action에서 입력한 경로에서 xml을 읽어올 수 있다.', () => {
        const file = readFileSyncMock(
            path.resolve(__dirname, 'junitResult.xml'),
            'utf-8'
        )
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '#_'
        })
        const result = parser.parse(file)
        expect(result).not.toBeFalsy()
    })

    it('Glob Pattern 기반으로 데이터를 읽어서 다건의 File을 읽어온다.', async () => {
        getWarningMock()

        const validateXml = (resultRawJson: any) => {
            if (resultRawJson['?xml']['#_version'] !== '1.0') {
                core.warning('File is not validate')
                return false
            }

            return true
        }

        const fileNames = await globLib.glob(path.resolve(__dirname, '**.xml'))
        const resultObjectList: string[] = fileNames
            .map(path => {
                return readFileSyncMock(path, 'utf-8')
            })
            .map(resultStr => {
                return new XMLParser({
                    ignoreAttributes: false,
                    attributeNamePrefix: '#_'
                }).parse(resultStr)
            })
            .filter(resultObj => {
                return validateXml(resultObj)
            })

        console.log(resultObjectList)
    })

    it(' sd', () => {
        const data = new XMLParser().parse('')
        console.log(data)
    })
    it('입력한 경로가 적합하지 않다면 Action에 파일이 없음을 알리고 Job을 중지시킨다.', () => {
        getInputMock()
        const notExistReport = setFailMock()
        try {
            fs.readFileSync(core.getInput('not_exist_file.xml'), 'utf-8')
        } catch (e: unknown) {
            const nodeJsException = e as NodeJS.ErrnoException
            if (nodeJsException.code === 'ENOENT') {
                core.setFailed('Report file is not exist')
            }

            core.setFailed('Unknown Exception with File')
        }

        expect(notExistReport).toHaveBeenNthCalledWith(
            1,
            'Report file is not exist'
        )
    })

    /**
     * 버전 체크
     * */
    it('XML 버전을 체크해서 1.0 버전이 아니라면 warning을 발생시켜서 알린다.', () => {
        const warningMock = getWarningMock()

        const version_one_file = readFileSyncMock(
            path.resolve(__dirname, 'junitResult.xml'),
            'utf-8'
        )

        const version_one_result = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '#_'
        }).parse(version_one_file)
        const version_two_result = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '#_'
        }).parse('<?xml version="2.0" encoding="UTF-8" ?>\n<test>hi</test>')

        const validateXml = (resultRawJson: object) => {
            if (version_one_result['?xml']['#_version'] === '1.0') {
                core.warning('Junit Version is not validate')
            }
        }

        validateXml(version_one_result)
        validateXml(version_two_result)

        expect(warningMock).toHaveBeenNthCalledWith(
            1,
            'Junit Version is not validate'
        )
    })
})

describe('다건의 result Xml을 받아서 결과를 집계한다.', () => {
    const resultObjectList: string[] = []
    beforeEach(async () => {
        getWarningMock()

        const fileNames = await globLib.glob(path.resolve(__dirname, '**.xml'))
        fileNames
            .map(path => {
                return readFileSyncMock(path, 'utf-8')
            })
            .map(resultStr => {
                return new XMLParser({
                    ignoreAttributes: false,
                    attributeNamePrefix: '#_'
                }).parse(resultStr)
            })
            .forEach(result => resultObjectList.push(result))
    })

    it('데이터를 집계한다.', () => {})
})
