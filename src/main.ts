import * as core from '@actions/core'
import { testResultReaderBasedXml } from './module/parser/testResultReader'
import { UserVariable } from './module/util'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
    // Action에서 변수를 받는다.
    const report_path = UserVariable.of(core.getInput('report_path')).getOrElse(
        'build/junit-test/TEST-*.xml'
    )

    // Path를 읽어서 fs 모듈로 파일을 읽은 후 결과 데이터를 반환시킨다.
    core.startGroup('Start Test Aggregate Processing');

    const testAggregate = testResultReaderBasedXml.aggregateTestResult(
        testResultReaderBasedXml.parseTestResult(report_path)
    )
    core.endGroup();

    core.startGroup('Setting Aggregate Result')

    core.setOutput('totalCount', testAggregate.totalCount)
    core.setOutput('passed', testAggregate.passed.count)
    core.setOutput('failed', testAggregate.failed.count)
    core.setOutput('skipped', testAggregate.skipped.count)

    core.endGroup()

    // 결과를 action에서 사용할 수 있도록 output으로 내보낸다.
}
