// From: https://github.com/haya14busa/action-workflow_run-status/blob/main/src/main.ts

import * as core from '@actions/core'
import * as github from '@actions/github'
import * as stateHelper from './state-helper'
import {wait} from './wait'

const context = github.context

type State = 'pending' | 'running' | 'failure' | 'success'
type CommitState = 'error' | 'failure' | 'pending' | 'success'

type JobPayload = {
  id: number
  run_id: number
  node_id: string
  head_sha: string
  url: string
  html_url: string | null
  status: string
  conclusion: string | null
  started_at: string
  completed_at: string | null
  name: string
  steps?: {
    name: string
    status: string
    conclusion: string | null
    number: number
    started_at?: string | null | undefined
    completed_at?: string | null | undefined
  }[]
  check_run_url: string
}

function getState(job?: JobPayload): State {
  if (context.payload.action === 'requested') {
    return 'pending'
  } else if (!stateHelper.IsPost) {
    return 'running'
  } else {
    // Find step with failure instead of relying on job.conclusion because this
    // (post) action itself is one of a step of this job and job.conclusion is
    // always null while running this action.
    const failedStep = job?.steps?.find(step => step.conclusion === 'failure')
    if (failedStep) {
      return 'failure'
    }
    return 'success'
  }
}

function getMessage(status: State): string {
  const statusMessage: string = core.getInput('message')
  const statusMessageOnSuccess: string = core.getInput('message_on_success')
  const statusMessageOnFailure: string = core.getInput('message_on_failure')
  const statusMessageOnRunning: string = core.getInput('message_on_running')
  const statusMessageOnPending: string = core.getInput('message_on_pending')

  switch (status) {
    case 'success':
      return statusMessageOnSuccess || statusMessage || 'Successfully finished'
    case 'failure':
      return statusMessageOnFailure || statusMessage || 'Failed'
    case 'running':
      return statusMessageOnRunning || statusMessage || 'Running'
    case 'pending':
      return (
        statusMessageOnPending || statusMessage || 'Waiting for preceding jobs'
      )
    default:
      return statusMessage
  }
}

function toCommitState(state: State): CommitState {
  switch (state) {
    case 'success':
      return 'success'
    case 'failure':
      return 'failure'
    case 'running':
      return 'pending'
    case 'pending':
      return 'pending'
    default:
      return 'error'
  }
}

async function run(): Promise<void> {
  try {
    const authToken: string = core.getInput('token', {required: true})
    const statusContext: string = core.getInput('context', {required: true})

    if (context.eventName !== 'workflow_run') {
      throw new Error('This action can only be used in a workflow_run event')
    }

    if (context.payload.workflow_run.event !== 'pull_request') {
      throw new Error(
        'This action only works on workflow_run triggered by a pull request.'
      )
    }

    if (!context.payload.repository) {
      throw new Error('Repository is missing.')
    }

    const octokit = github.getOctokit(authToken)

    if (stateHelper.IsPost) {
      core.info(
        '10 secs to wait for other steps job completion are propagated to GitHub API response.'
      )
      await wait(10 * 1000)
    }

    const jobs = await octokit.rest.actions.listJobsForWorkflowRun({
      owner: context.repo.owner,
      repo: context.repo.repo,
      run_id: context.runId,
      filter: 'latest',
      per_page: 100
    })
    const job = jobs.data.jobs.find(j => j.name === context.job)
    if (!job) {
      throw new Error(`job not found: ${context.job}`)
    }

    const state = getState(job)
    const repoName: string =
      context.payload.repository.full_name ||
      `${context.repo.owner}/${context.repo.repo}`

    let statusTargetUrl: string | undefined = undefined
    if (state === 'success' || state === 'failure') {
      statusTargetUrl = `https://github.com/${repoName}/actions/runs/${context.runId}`
    }

    for (const pr of context.payload.workflow_run.pull_requests) {
      if (!(pr.base.repo.url as string).endsWith(repoName)) {
        continue
      }
      octokit.rest.repos.createCommitStatus({
        owner: context.repo.owner,
        repo: context.repo.repo,
        sha: pr.head.sha,
        state: toCommitState(state),
        context: statusContext,
        description: getMessage(state),
        target_url: statusTargetUrl
      })
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(error as string)
    }
  }
}

run()
