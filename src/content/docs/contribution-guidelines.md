---
title: Contribution Guidelines
description: How to contribute to the docs
weight: 10
---

We use [Hugo](https://gohugo.io/) to format and generate our website, and the
[Docsy](https://github.com/google/docsy) theme for styling and site structure.
Hugo is an open-source static site generator that provides us with templates,
content organisation in a standard directory structure, and a website generation
engine. You write the pages in Markdown (or HTML if you want), and Hugo wraps
them up into a website.

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

## Updating a single page

If you've just spotted something you'd like to change while using the docs,
Docsy has a shortcut for you:

1. Click **Edit this page** in the top right hand corner of the page.
2. If you don't already have an up to date fork of the project repo, you are
   prompted to get one - click **Fork this repository and propose changes** or
   **Update your Fork** to get an up to date version of the project to edit. The
   appropriate page in your fork is displayed in edit mode.
3. Make your changes and send a pull request (PR).
4. If you're not yet ready for a review, add "WIP" to the PR name to indicate
  it's a work in progress. (**Don't** add the Hugo property
  "draft = true" to the page front matter, because that prevents the
  auto-deployment of the content preview described in the next point.)
5. Continue updating your doc and pushing your changes until you're happy with
  the content.
6. When you're ready for a review, add a comment to the PR, and remove any
  "WIP" markers.

## Previewing your changes locally

If you want to run your own local Hugo server to preview your changes as you work:

1. Follow the instructions in [Getting
   started](https://www.docsy.dev/docs/get-started/) to install Hugo and any
   other tools you need, or use [Docker Compose](https://docs.docker.com/compose/install/)
   to run tools inside a container after completing step 2.
2. Fork the [Datum Documentation repo](https://github.com/datum-cloud/docs) repo
   into your own project, then create a local copy using `git clone`. Don’t
   forget to use `--recurse-submodules` or you won’t pull down some of the code
   you need to generate a working site.

    ```shell
    git clone --recurse-submodules --depth 1 https://github.com/datum-cloud/docs.git
    ```
<!-- -->
1. Run `hugo server` in the site root directory. By default your site will be
   available at http://localhost:1313/. Now that you're serving your site
   locally, Hugo will watch for changes to the content and automatically refresh
   your site.
2. Continue with the usual GitHub workflow to edit files, commit them, push the
  changes up to your fork, and create a pull request.

## Creating an issue

If you've found a problem in the docs, but you're not sure how to fix it
yourself, please create an issue in the [Datum Documentation repo](https://github.com/datum-cloud/docs/issues).
You can also create an issue about a specific page by clicking the
**Create Issue** button in the top right hand corner of the page.

## Useful resources

* [Docsy user guide](https://www.docsy.dev/docs/): All about Docsy, including
  how it manages navigation, look and feel, and multi-language support.
* [Hugo documentation](https://gohugo.io/documentation/): Comprehensive
  reference for Hugo.
* [Github Hello World!](https://guides.github.com/activities/hello-world/): A
  basic introduction to GitHub concepts and workflow.
