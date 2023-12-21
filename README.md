# Junit Report for Action
Junit 테스트 결과를 요약해서 Action 내부에서 사용 가능하도록 반환합니다.

---
# Get Started
## Inputs
| Input | Description                                                                      |
|----|----------------------------------------------------------------------------------|
|report_path    | Junit Report XML 경로,<br/>Default: `build/junit-test/TEST-*.xml`                  |

## Sample
```yaml
      # Test 결과 집계
      - id: test-aggregate
        name: Test Aggregate
        if: success() || failure()
        uses: sis92345/junit-report-for-action@v1.1.1
        # Input Option
        with:
          report_path: "**/example-project/build/test-results/test/TEST-*.xml"
      # Test 결과 출력
      - id : get-test-data
        if: success() || failure()
        name: Get Test Output Data
        run: |
      # Slack으로 전송
      - id: slack-post
        if: success() || failure()
        uses: slackapi/slack-github-action@v1.24.0
        with:
          channel-id: 'github-action-test'
          slack-message: "Test Result\n🟰Total : ${{ steps.test-aggregate.outputs.totalCount }}\n🎫 Passed : ${{ steps.test-aggregate.outputs.passed }}\n 𝍐 Failed : ${{ steps.test-aggregate.outputs.failed }}\n ⏮Skipped : ${{ steps.test-aggregate.outputs.skipped }} "
        env:
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```
---
## 계획
1. 실패 테스트명 보고 (⭐️⭐⭐⭐⭐)
2. 테스트 구현체 추가 (⭐️⭐⭐⭐)
2. Slack 내제화 (⭐⭐⭐)
3. Issue 연계 (⭐⭐)