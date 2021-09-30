# workflow-run-status-action

> This action is forked from [haya14busa/action-workflow_run-status](https://github.com/haya14busa/action-workflow_run-status).

![image](https://user-images.githubusercontent.com/1029205/135450564-0f965a55-fc11-41ee-ae6d-4637c8c88142.png)

This action updates the commit status to the pull request that triggered the [workflow_run](https://docs.github.com/en/actions/learn-github-actions/events-that-trigger-workflows#workflow_run).

## Usage
Just add `WonyoungChoi/workflow-run-status-action@v1` as a first step of workflow jobs triggered by workflow_run event.

```yaml
name: workflow-run-test

on:
  workflow_run:
    workflows: ["build-test"]
    types:
      - requested
      - completed

jobs:
  test-on-workflow-run:
    runs-on: ubuntu-latest
    steps:
      - uses: WonyoungChoi/workflow-run-status-action@v1
        with:
          message_on_pending: 'Waiting for build finish'
          message_on_success: 'Successfully finished'
          message_on_failure: 'Failed'
      ...
```

## Inputs
- token: GitHub access token. Default is `GITHUB_TOKEN`.
- context: A displayed commit status context on a pull request.
- message: A default commit status message if the `message_on_*` is not set.
- message_on_pending: The commit status message when the `workflow_run` event is triggered by `requested` event.
- message_on_success: The commit status message when the `workflow_run` event is successfully completed.
- message_on_failure: The commit status message when the `workflow_run` event is failed.
- message_on_running: The commit status message when the `workflow_run` event is running.
