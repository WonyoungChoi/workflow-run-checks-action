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

test('tests run without_state', () => {
  process.env['INPUT_TOKEN'] = '_A_TOKEN_'
  process.env['INPUT_CONTEXT'] = '_A_CONTEXT_'
  const result = executeAction()
  console.log(result)
  expect(result).toMatch('::error::Input required and not supplied: state')
})

test('tests run with_invalid_state', () => {
  process.env['INPUT_TOKEN'] = '_A_TOKEN_'
  process.env['INPUT_CONTEXT'] = '_A_CONTEXT_'
  process.env['INPUT_STATE'] = 'invalid'
  const result = executeAction()
  console.log(result)
  expect(result).toMatch('::error::Invalid state: invalid')
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
