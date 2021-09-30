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
