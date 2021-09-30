import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'

test('tests run without token', () => {
  const result = executeAction()
  expect(result).toMatch('::error::Input required and not supplied: token')
})

test('tests run without context', () => {
  process.env['INPUT_TOKEN'] = '_A_TOKEN_'
  const result = executeAction()
  expect(result).toMatch('::error::Input required and not supplied: context')
})

test('tests run not on workflow_run', () => {
  process.env['INPUT_TOKEN'] = '_A_TOKEN_'
  process.env['INPUT_CONTEXT'] = '_A_CONTEXT_'
  process.env['GITHUB_EVENT_NAME'] = 'pull_request'
  const result = executeAction()
  expect(result).toMatch(
    '::error::This action can only be used in a workflow_run event'
  )
})

test('tests run triggred by push', () => {
  process.env['INPUT_TOKEN'] = '_A_TOKEN_'
  process.env['INPUT_CONTEXT'] = '_A_CONTEXT_'
  process.env['GITHUB_EVENT_NAME'] = 'workflow_run'
  process.env['GITHUB_EVENT_PATH'] = path.join(
    __dirname,
    'payload_triggered_by_push.json'
  )
  const result = executeAction()
  expect(result).toMatch(
    '::error::This action only works on workflow_run triggered by a pull request.'
  )
})

function executeAction() {
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }

  let result: string = ''
  try {
    result = cp.execFileSync(np, [ip], options).toString()
  } catch (error) {
    result = error.stdout.toString()
  }
  return result
}
