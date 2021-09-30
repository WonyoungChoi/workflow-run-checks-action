# workflow-run-status-action

![image](https://user-images.githubusercontent.com/1029205/135437946-5367be02-43e6-496a-81fb-be9735b37578.png)

This action updates the commit status to the pull request that triggered the workflow_run.

## Usage
```yaml
name: workflow-run-test

on:
  workflow_run:
    workflows: ["build-test"]
    types:
      - requested
      - completed

jobs:
  pending:
    if: |
      github.event.action == 'requested' &&
      github.event.workflow_run.event == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: ./
        with:
          message_on_pending: 'Waiting for build finish'

  test:
    if: |
      github.event.action == 'completed' &&
      github.event.workflow_run.event == 'pull_request' &&
      github.event.workflow_run.conclusion == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: ./
        with:
          message_on_success: 'Successfully finished'
          message_on_failure: 'Failed'
      - uses: juliangruber/sleep-action@v1
        with:
          time: 10s

  test-failure:
    if: |
      github.event.action == 'completed' &&
      github.event.workflow_run.event == 'pull_request' &&
      github.event.workflow_run.conclusion == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: ./
        with:
          context: '${{ github.workflow }} / ${{ github.job }}'
          message_on_success: 'Successfully finished'
          message_on_failure: 'Failed'
      - run: exit 1
```