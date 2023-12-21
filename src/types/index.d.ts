/**
 * 테스트 결과를 읽고 테스트 결과를 반환시키는 객체
 *
 * @property {TestParser} testParser : Test 결과 반환 모듈 구현체
 * @property {(globPattern: string) => Suite[]}  : Glob Pattern을 받아서 테스트 결과를 반환합니다.
 * @property {(results : Suite[]) => TestAggregate} : Test 결과를 읽어서 결과를 단일 객체로 반환시킵니다.
 * */
export interface TestResultReader {

    readonly testParser : TestParser

    /**
     * Path를 받아서 테스트 파일을 읽은 후 각 테스트 결과를 반환합니다.
     * */
    parseTestResult : (globPattern: string) => Suite[]

    aggregateTestResult: (results : Suite[]) => TestAggregate
}

/**
 * 특정 Format을 받아서 테스트 결과 Json을 생성합니다.
 * */
export interface TestParser {

    parse(globPattern: string) : Suite[]
}

/**
 * 테스트 결과
 * */
export type TestAggregate = {
    totalCount : number,
    passed: {
        count : number,
        list  : Suite[]
    },
    failed: {
        count : number,
        list  : Suite[]
    },
    skipped: {
        count : number,
        list  : Suite[]
    },
}

export type Suite = {
    name : string
    status    : "passed" | "failed" | "skipped"
    cause     : string
}

export type JunitResultXml = {
    "?xml" : {_version : string, _encoding : string}
    properties: string,
    testsuite: {
        testcase : testCaseRaw[]
    }
}

export type testCaseRaw = {
    _name: string
    , _classname: string
    , _time: string
    , failure? : {
        #text: string,
        _message: string
        _type: string
    },
    skipped? : ""
}