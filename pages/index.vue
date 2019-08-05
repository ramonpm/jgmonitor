<template>
  <div class="container">
    <table class="table table-bordered table-striped table-hover">
      <thead>
        <tr>
          <th>QE Ticket</th>
          <th>Parent Ticket</th>
          <th>Pull Request</th>
          <th>Files Extensions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ticket in tickets" :key="ticket.key">
          <td>
            <a :href="ticket.qeUrl" target="_blank">
              {{ ticket.qeKey }}
            </a>
          </td>
          <td>
            <a :href="ticket.url" target="_blank">
              {{ ticket.key }}
            </a>
          </td>
          <td>
            <a :href="ticket.prUrl">
              {{ ticket.prUrl }}
            </a>
          </td>
          <td>
            <i
              v-for="ext in extractFileExtensions(ticket.files)"
              :key="ext"
              class="lang-badge"
            >
              {{ ext }}
            </i>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import Octokit from '@octokit/rest'
import axios from 'axios'
import getPullRequestParams from '../libs/get-pull-request-params'

export default {
  computed: {
    allExtensions() {
      const allFiles = this.tickets.map((ticket) => ticket.files)
      return this.extractFileExtensions(allFiles)
    }
  },
  async asyncData() {
    const octokit = new Octokit({
      auth: process.env.GH_TOKEN
    })

    const jira = axios.create({
      baseURL: `${process.env.JIRA_URL}rest/api/2/`,
      timeout: 50000,
      headers: { Authorization: `Basic ${process.env.JIRA_TOKEN}` }
    })

    const {
      data: { issues: qeIssues }
    } = await jira.get(
      'search?jql=type+%3D+%22Maint+QE+Output+Review%22+AND+status+%3D+%22In+Review%22+AND+assignee+is+EMPTY+AND+project+not+in+(emep,+INFVAIOF,+OSCID)+ORDER+BY+key+ASC'
    )

    const issuesKeys = qeIssues.map((i) => i.fields.parent.key)

    const {
      data: { issues }
    } = await jira.get(
      `search?jql=key+in+(${issuesKeys.join(',')})+ORDER+BY+key+ASC`
    )

    const tickets = []

    // qeIssues and issues should contain same size
    for (let i = 0; i < qeIssues.length; i++) {
      const prUrl = issues[i].fields.customfield_11700
      const { owner, repo, pullNumber } = getPullRequestParams(prUrl)

      const ghData =
        owner &&
        repo &&
        pullNumber &&
        (await octokit.pulls.listFiles({
          owner,
          repo,
          pull_number: pullNumber
        }))

      const files = ghData && ghData.data

      tickets.push({
        qeKey: qeIssues[i].key,
        qeUrl: `${process.env.JIRA_URL}browse/${qeIssues[i].key}`,
        key: issues[i].key,
        url: `${process.env.JIRA_URL}browse/${issues[i].key}`,
        prUrl,
        files
      })
    }

    return {
      tickets
    }
  },
  methods: {
    extractFileExtensions(ghFilesResponse) {
      if (!ghFilesResponse) return []
      return [
        ...new Set(
          ghFilesResponse.map((file) =>
            file.filename ? file.filename.split('.').pop() : 'None'
          )
        )
      ]
    }
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.links {
  padding-top: 15px;
}

.lang-badge {
  background-color: aqua;
  border: 1px solid #74f7f7;
  border-radius: 4px;
  padding: 1px;
}

.lang-badge:not(:last-child) {
  margin-right: 5px;
}
</style>
