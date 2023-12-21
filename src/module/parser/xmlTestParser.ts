import {JunitResultXml, Suite, testCaseRaw, TestParser} from "../../types";
import {XMLParser} from "fast-xml-parser";
import * as core from "@actions/core";
import {readFileSync} from "fs"
import {globSync} from "glob";
import {UserVariable} from "../util";

const _private = {
    xmlParser : new XMLParser({ignoreAttributes : false, attributeNamePrefix: "_"}),
    validateXml : (resultRawJson : JunitResultXml) => {
        if (resultRawJson["?xml"]._version !== "1.0") {
            core.warning("Result Xml versions is not 1.0")
            return false;
        }

        return true;
    },
}

/**
 * Junit-Xml Result 기반 테스트를 읽어서 결과를 반환하는 구현제
 * */
export const xmlTestParser : TestParser = {

    parse(globPattern: string): Suite[] {

        const resultFileStr = globSync(globPattern)
            .map(path => {
                try {
                    return readFileSync(path, "utf-8")
                } catch (e) {
                    const nodeJsException = e as NodeJS.ErrnoException;
                    if (nodeJsException.code === "ENOENT") {
                        core.error("Report file is not exist")
                    }
                    else {
                        core.error("Unknown Exception with File")
                    }
                    return "";
                }
            });

        return resultFileStr.map(fileStr =>
            UserVariable.of<JunitResultXml>(_private.xmlParser.parse(fileStr))
            .getOrElse({
                "?xml" : {_version : "EMPTY", _encoding : ""},
                properties: "",
                testsuite: {
                    testcase : []
                }
            }))
          .filter(result => _private.validateXml(result))
          .flatMap(result => result.testsuite.testcase)
          .map((result : testCaseRaw)=> {

                  const status
                      = result.failure == undefined && result.skipped == undefined
                                    ? "passed"
                                    : result.skipped == undefined
                                    ? "failed" : "skipped"

                  return {
                      cause: result?.failure?._message || ""
                      , name: result._name
                      , status: status
                  }
          })
    }
}
