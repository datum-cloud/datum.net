---
title: Datum Documentation
description: Datum is a network cloud you can take anywhere, backed by open source
---

Our cloud platform, global network, and open source tooling are designed to help developers and modern service providers run network workloads anywhere while connecting their applications programmatically to the hundreds — or thousands — of partners, providers and customers that make up their unique ecosystem.

## Get Started

:::caution[Disclaimer]
The Datum platform is currently at a Preview stage and is not currently suitable
for production use cases.
:::

The Datum control plane is a collection of multiple projects developed with
Kubernetes control plane technology, most of which can be installed into native
Kubernetes clusters.

As a result, you will leverage common Kubernetes tooling such as [kubectl][kubectl]
to interact with Datum.

### Quick Installation

#### datumctl

<Tabs>
<TabItem value="brew" label="Brew">

Install datumctl with the [Homebrew](https://brew.sh/) package manager on macOS or Linux:

```shell
brew install datum-cloud/tap/datumctl
```

</TabItem>
<TabItem value="curl" label="Curl">

Install manually with curl on Linux or macOS

```shell
export OS=$(uname -s)
export ARCH=$(uname -m)

curl -Lo ./datumctl.tar.gz https://github.com/datum-cloud/datumctl/releases/latest/download/datumctl_${OS}_${ARCH}.tar.gz

# Extract and install the datumctl binary
tar zxvf datumctl.tar.gz datumctl
chmod +x datumctl
mkdir -p ~/.local/bin
mv ./datumctl ~/.local/bin/datumctl
# and then append (or prepend) ~/.local/bin to $PATH
```

</TabItem>
<TabItem value="go" label="Go">

Install via Go

```shell
go install go.datum.net/datumctl@latest
# Ensure that $GOPATH/bin is in your PATH
export PATH=$PATH:$(go env GOPATH)/bin
```

</TabItem>
<TabItem value="powershell" label="Windows PowerShell">

Install datumctl on Windows using PowerShell

```powershell
Invoke-WebRequest -Uri "https://github.com/datum-cloud/datumctl/releases/latest/download/datumctl_Windows_x86_64.zip"  -OutFile "datumctl.zip"
Expand-Archive -Path "datumctl.zip" -DestinationPath "datumctl"
```

Move the `datumctl.exe` file to a directory in your `PATH` or simply run it from the current directory:

```powershell
.\datumctl\datumctl.exe
```

</TabItem>
</Tabs>

#### kubectl

Refer to the [official Kubernetes documentation][kubectl-task] for installation
instructions, making sure to **skip the Verify kubectl configuration** section in
the guide you choose.

Later in this guide, you will configure a [kubeconfig file](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/)
as required to interact with Datum via kubectl.

[kubectl]: https://kubernetes.io/docs/reference/kubectl/kubectl/
[kubectl-task]: https://kubernetes.io/docs/tasks/tools/#kubectl

For convenience, homebrew instructions are below:

<Tabs>
<TabItem value="brew" label="Brew">

Install kubectl with the [Homebrew](https://brew.sh/) package manager on macOS or Linux:

```shell
brew install kubectl
```

</TabItem>
</Tabs>

#### Create API Credentials

1. Sign in to Datum at <https://cloud.datum.net>
2. Create an API token by clicking on your User Initials / Avatar (top right)
   and then navigating to **API Keys > New API Key**. Save this API Key in
   your password manager or preferred method of storage.

#### Configure Tools

##### Authentication

Configure datumctl authentication by activating the API token created in the
previous section. Run the following command and enter your API token at the
prompt:

```shell
datumctl auth activate-api-token
```

##### Add a kubeconfig context for your organization

Obtain your organization's resource ID with datumctl by listing organizations
that your user has access to:

```shell
datumctl organizations list
```

The output is similar to:

```shell
DISPLAY NAME           RESOURCE ID
Personal Organization  pp4zn7tiw5be3beygm2d6mbcfe
```

Create a kubeconfig context to access your organization's resources by copying
the the `RESOURCE ID` value and executing following command, replacing
`RESOURCE_ID` with the value:

```shell
datumctl auth update-kubeconfig --organization RESOURCE_ID
```

The output is similar to:

```shell
Successfully updated kubeconfig at getting-started.kubeconfig
```

##### Verify kubectl configuration

Check that kubectl is properly configured by getting authorized user info:

```shell
kubectl auth whoami
```

The output is similar to:

```shell
ATTRIBUTE                                                VALUE
Username                                                 datum@example.com
Groups                                                   [system:authenticated]
Extra: authentication.datum.net/datum-organization-uid   [pp4zn7tiw5be3beygm2d6mbcfe]
Extra: authentication.kubernetes.io/credential-id        [JTI=01jgsr1m8fpb9cn0yrh05taa5v]
```


#### Account Registration

Sign up for an account at <https://cloud.datum.net>.

#### Organizations

Datum manages resources within Organizations and Projects. When you sign up,
a personal organization is automatically created for you.

You may create additional organizations, which you can invite team members to
join.



### Create a project

#### Portal Alternative

This tutorial uses a kubectl with manifest driven workflow to create your first project. Alternatively, you can create your first project via the Datum Cloud Portal.

#### Confirm your kubeconfig context

Ensure that your kubectl tool is configured to use the correct context to interact
with your organization by running the following command:

```shell
kubectl config current-context
```

The output is similar to:

```shell
datum-organization-pp4zn7tiw5be3beygm2d6mbcfe
```

Write the following project manifest to `intro-project.yaml`.

Note that `generateName` is used here, which will result in a name with the prefix of
`intro-project-` and a random suffix.

```yaml
apiVersion: resourcemanager.datumapis.com/v1alpha
kind: Project
metadata:
  generateName: intro-project-
spec:
```

Create the project

```shell
kubectl create -f intro-project.yaml
```

The output is similar to:

```shell
project.resourcemanager.datumapis.com/intro-project-zj6wx created
```

Copy the generated project name, in this example it is `intro-project-zj6wx`.

Wait for the project's control plane to become ready, which can take up to two
minutes. Exit the command once the control plane status is `Ready`.

```shell
kubectl get projects -w
```

The output is similar to:

```shell
NAME                   AGE   CONTROL PLANE STATUS
intro-project-zj6wx   2s    APIServerProvisioning
intro-project-zj6wx   22s   ControllerManagerProvisioning
intro-project-zj6wx   43s   NetworkServicesOperatorProvisioning
intro-project-zj6wx   64s   WorkloadOperatorProvisioning
intro-project-zj6wx   106s   InfraProviderGCPProvisioning
intro-project-zj6wx   2m3s   Ready
```

#### Add a kubeconfig context for your project

Create a kubeconfig context to access your project's resources by executing
following command, replacing `PROJECT_NAME` with your project's name.

*Note: If you created your project via Datum Cloud Portal, you'll want to copy/paste the same project name into the command below.*

```shell
datumctl auth update-kubeconfig --project PROJECT_NAME
```

Confirm that the project's control plane is accessible:

```shell
kubectl explain locations.spec
```

```shell
GROUP:      networking.datumapis.com
KIND:       Location
VERSION:    v1alpha

FIELD: spec <Object>


DESCRIPTION:
    LocationSpec defines the desired state of Location.

... continued
```

## Learn
Core concepts and architecture 
need-content-here

## Deploy
Production deployment guides
need-content-here

## Develop
APIs, SDKs, and integration guides
need-content-here

## Operate
Management, monitoring, troubleshooting
need-content-here
