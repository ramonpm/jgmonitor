# JGmonitor

> Monitor Jira tickets extracting information from Github to define languages / file extensions of the changed files in pull requests

For now the important code is in the [Index Page](pages/index.vue)

# Concept

Created as a Proof of Concept.

This app is intended to use only on personal machine with personal credentials.
No best practices followed.
No security checks intended.

Designed to be just a tool for people who need to collect info from Jira crossed with Github.

> If proved valuable should be rebuilt with proper stack.

# Stack

  - Octokit (Github Rest.js SDK)
  - Axios (AJAX calls to JIRA Rest API)
  - Nuxt.js (SSR + Vue.js + Javascript)

  This is far from ideal, picked nuxtjs just because I wanted to give a try. 
  
  Since our JIRA server doesn't allow CORS, requests from the browser throws CORS exception hence need to be done on server-side. That's why SSR was used.

  The ideal stack here would have to have an app server like express, meteor or whatever other server. *(It's better to be done before evolving this app)*

# How to run

``` bash
# install dependencies
$ yarn install

# Generate your GH Token via github.com inside your user settings
# browse https://github.com/settings/tokens

# Generate your JIRA TOKEN
echo -n "user:password" | base64

# serve with hot reload at localhost:3000
$ GH_TOKEN=<your github token> JIRA_TOKEN=<your jira token> JIRA_URL=<jira server url> yarn dev
```

Ex: `GH_TOKEN=2312jk3213jk321 JIRA_TOKEN=3213lkj123lkjad JIRA_URL=https://jira.atlassian.com/ yarn dev`

# False positive error

  Because of CORS restrictions, if you make any change to the codebase it'll throw CORS exception in the browser as the hot reload doesn't trigger server-side calls, hit browser Refresh button then.
