import {Suite, TestAggregate, TestParser, TestResultReader} from "../../types";
import {xmlTestParser} from "./xmlTestParser";

const testResultReader = (testParser : TestParser) : TestResultReader => {
    return {
        testParser,

        parseTestResult(globPattern: string): Suite[] {
            return testParser.parse(globPattern);
        },

        aggregateTestResult(results: Suite[]): TestAggregate {

            const aggregate : TestAggregate =  {
                totalCount : 0
                , failed: {count: 0, list: []}
                , passed: {count: 0, list: []}
                , skipped: {count: 0, list: []}};

            results.map(suite => {
                if (suite.status === "passed") {
                    aggregate.passed.list.push(suite);
                    aggregate.passed.count += 1;
                } else if (suite.status === "failed") {
                    aggregate.failed.list.push(suite)
                    aggregate.failed.count += 1;
                }else {
                    aggregate.skipped.list.push(suite)
                    aggregate.skipped.count += 1;
                }
                aggregate.totalCount+=1;
            });

            return aggregate;
        },
    }
}

export const testResultReaderBasedXml = testResultReader(xmlTestParser);