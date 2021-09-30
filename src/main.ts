import * as core from '@actions/core'
import * as github from '@actions/github'

type State = 'error' | 'failure' | 'pending' | 'success'

function toState(str: string): State {
  if (
    str === 'error' ||
    str === 'failure' ||
    str === 'pending' ||
    str === 'success'
  ) {
    return str
  } else {
    throw new Error(`Invalid state: ${str}`)
  }
}

async function run(): Promise<void> {
  try {
    const authToken: string = core.getInput('token', {required: true})
    const statusContext: string = core.getInput('context', {required: true})
    const statusState: State = toState(core.getInput('state', {required: true}))
    const statusDescription: string = core.getInput('description')
    const statusTargetUrl: string = core.getInput('targetUrl')

    const context = github.context

    if (context.payload.workflow_run.event !== 'pull_request') {
      throw new Error(
        'This action only works on workflow_run triggered by a pull request.'
      )
    }

    const octokit = github.getOctokit(authToken)

    for (const pr of context.payload.workflow_run.pull_requests) {
      if (pr.base.repo.url !== context.payload.repository?.url) {
        continue
      }
      octokit.rest.repos.createCommitStatus({
        owner: context.repo.owner,
        repo: context.repo.repo,
        sha: pr.head.sha,
        state: statusState,
        context: statusContext,
        description: statusDescription,
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
