---
title: Developer Guide
description: This guide helps you get started developing Datum components.
weight: 30
---

## Summary

This guide provides step-by-step instructions for setting up a development
environment to install and run the Datum Cloud operators. It is targeted toward
a technical audience familiar with Kubernetes, kubebuilder, and
controller-runtime.

By following this guide, you will:

- Install and configure necessary development tools.
- Set up a kind cluster for access to a Kubernetes control plane.
- Install and run the Workload Operator, Network Services Operator, and Infra
  Provider GCP components.
- Configure and use Config Connector for managing GCP resources.
- Register a Location and create a sample Datum Workload.

## Prerequisites

Ensure the following are installed and properly configured:

- [Git](https://github.com/git-guides/install-git)
- [Go 1.23 or greater](https://go.dev/doc/install)
- [Docker Desktop](https://www.docker.com/get-started/)
- [Kubebuilder](https://book.kubebuilder.io/quick-start.html#installation)
- [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installing-with-a-package-manager)
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
- [gcloud](https://cloud.google.com/sdk/docs/install)

### Troubleshooting

If errors such as `Command 'make' not found` are encountered, reference the
following guides for installing required build tools:

- [Preparing Your Local Operating System](https://github.com/kubernetes/community/blob/master/contributors/devel/development.md#preparing-your-local-operating-system)
- [Installing Required Software](https://github.com/kubernetes/community/blob/master/contributors/devel/development.md#installing-required-software)

## Control Plane Setup

### Create Kind Cluster

Create a kind cluster for development:

```shell
kind create cluster --name datum
```

## Install Third Party Operators

### cert-manager

Install cert-manager:

```shell
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
```

Ensure that cert-manager pods are running and ready:

```shell
kubectl wait -n cert-manager --for=condition=Ready pod --all
```

The output is similar to:

```shell
pod/cert-manager-b6fd485d9-2s78z condition met
pod/cert-manager-cainjector-dcc5966bc-ntbw4 condition met
pod/cert-manager-webhook-dfb76c7bd-vxgb8 condition met
```

Refer to the [cert-manager installation guide](https://cert-manager.io/docs/installation/)
for more details.

### GCP Config Connector

GCP Config Connector is used to manage Google Cloud resources directly from
Kubernetes. The infra-provider-gcp application integrates with GCP Config
Connector to create and maintain resources in GCP based on Kubernetes custom
resources.

<span class="alert alert-info">Tip: The service account creation instructions in the installation guide result in granting significantly more access to the GCP project than necessary. It is recommended to only bind the following roles to the service account:

- `roles/compute.admin`
- `roles/container.admin`
- `roles/secretmanager.admin`
- `roles/iam.serviceAccountAdmin`
- `roles/iam.serviceAccountUser`</span>

Follow the [installation guide](https://cloud.google.com/config-connector/docs/how-to/install-other-kubernetes),
making sure to retain the service account credential saved to `key.json`, as
this will be required later by `infra-provider-gcp`. The target Kubernetes cluster
will be the kind cluster created in this guide.

<span class="alert alert-info">Note: The section "Specifying where to create your resources" can be skipped.</span>

## Datum Operator Installation

Clone the following repositories into the same parent folder for ease of use:

- [Workload Operator](https://github.com/datum-cloud/workload-operator/tree/integration/datum-poc)
- [Network Services Operator](https://github.com/datum-cloud/network-services-operator/tree/integration/datum-poc)
- [Infra Provider GCP](https://github.com/datum-cloud/infra-provider-gcp/tree/integration/datum-poc)

<span class="alert alert-info">Note: The `make` commands can take some time to execute for the first time.</span>

### Workload Operator

1. In a separate terminal, navigate to the cloned `workload-operator` repository:

    ```shell
    cd /path/to/workload-operator
    ```

2. Install CRDs:

    ```shell
    make install
    ```

3. Start the operator:

    ```shell
    make run
    ```

### Network Services Operator

1. In a separate terminal, navigate to the cloned `network-services-operator` repository:

    ```shell
    cd /path/to/network-services-operator
    ```

2. Install CRDs:

    ```shell
    make install
    ```

3. Start the operator:

    ```shell
    make run
    ```

### Infra Provider GCP

1. In a separate terminal, navigate to the cloned `infra-provider-gcp` repository:

    ```shell
    cd /path/to/infra-provider-gcp
    ```

2. Create an `upstream.kubeconfig` file pointing to the `datum` kind cluster.
   This extra kubeconfig file is required due to the operator's need to
   orchestrate resources between multiple control planes. For development
   purposes, these can be the same endpoints.

    ```shell
    kind export kubeconfig --name datum --kubeconfig upstream.kubeconfig
    ```

3. Start the operator after ensuring that the `GOOGLE_APPLICATION_CREDENTIALS`
  environment variable is set to the path for the key saved while installing
  [GCP Config Connector](#gcp-config-connector).

    ```shell
    export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
    ```

    ```shell
    make run
    ```

## Create Datum Resources

### Register a Self Managed Location

Before creating a workload, a Location must be registered.

Use the following example manifest to create a location which Datum's control
plane will be responsible for managing, replacing `GCP_PROJECT_ID` with
your GCP project id:

```yaml
apiVersion: networking.datumapis.com/v1alpha
kind: Location
metadata:
  name: my-gcp-us-south1-a
spec:
  locationClassName: self-managed
  topology:
    topology.datum.net/city-code: DFW
  provider:
    gcp:
      projectId: GCP_PROJECT_ID
      region: us-south1
      zone: us-south1-a
```

1. Replace `topology.datum.net/city-code`'s value (`DFW`) with the desired city
   code for your workloads.
2. Update the `gcp` provider settings to reflect your GCP project ID, desired
   region, and zone.

Apply the manifest:

```shell
kubectl apply -f <path-to-location-manifest>
```

List Locations:

```shell
kubectl get locations
```

```shell
NAME                 AGE
my-gcp-us-south1-a   5s
```

### Create a Network

Before creating a workload, a Network must be created. You can use the following
manifest to do this:

{{< alert title="Note" color="info">}}
In the future, a default network may automatically be created in a namespace.
{{< /alert >}}

```yaml
apiVersion: networking.datumapis.com/v1alpha
kind: Network
metadata:
  name: default
spec:
  ipam:
    mode: Auto
```

Apply the manifest:

```shell
kubectl apply -f <path-to-network-manifest>
```

List Networks:

```shell
kubectl get networks
```

```shell
NAME      AGE
default   5s
```

### Create a Workload

<span class="alert alert-warning">Caution: These actions will result in billable resources being created in the GCP project for the target location. Destroy any resources which are not needed to avoid unnecessary costs.</span>

Create a manifest for a sandbox based workload, for example:

```yaml
apiVersion: compute.datumapis.com/v1alpha
kind: Workload
metadata:
  name: my-container-workload
spec:
  template:
    spec:
      runtime:
        resources:
          instanceType: datumcloud/d1-standard-2
        sandbox:
          containers:
            - name: httpbin
              image: mccutchen/go-httpbin
              ports:
                - name: http
                  port: 8080
      networkInterfaces:
        - network:
            name: default
          networkPolicy:
            ingress:
              - ports:
                - port: 8080
                from:
                  - ipBlock:
                      cidr: 0.0.0.0/0
  placements:
    - name: us
      cityCodes: ['DFW']
      scaleSettings:
        minReplicas: 1
```

Apply the manifest:

```shell
kubectl apply -f <path-to-workload-manifest>
```

#### Check the state of the workload

```shell
kubectl get workloads
```

The output is similar to:

```shell
NAME                    AGE   AVAILABLE   REASON
my-container-workload   9s    False       NoAvailablePlacements
```

The `REASON` field will be updated as the system progresses with attempting to
satisfy the workload's intent.

#### Check Workload Deployments

A Workload will result in one or more WorkloadDeployments being created, one for
each unique CityCode per placement.

```shell
kubectl get workloaddeployments
```

The output is similar to:

```shell
NAME                           AGE   LOCATION NAMESPCE   LOCATION NAME        AVAILABLE   REASON
my-container-workload-us-dfw   58s   default             my-gcp-us-south1-a   False       LocationAssigned
```

Similar to workloads, the `REASON` field will be updated as the system
progresses with attempting to satisfy the workload's intent. In this case, the
`infra-provider-gcp` operator is responsible for these actions.

#### Check Instances

```shell
kubectl -n default get instances -o wide
```

The output is similar to:

```shell
NAME                             AGE   AVAILABLE   REASON              NETWORK IP   EXTERNAL IP
my-container-workload-us-dfw-0   24s   True        InstanceIsRunning   10.128.0.2   34.174.154.114
```

Confirm that the go-httpbin application is running:

```shell
curl -s http://34.174.154.114:8080/uuid
```

```json
{
  "uuid": "8244205b-403e-4472-8b91-728245e99029"
}
```

#### Delete the workload

Delete the workload when testing is complete:

```shell
kubectl delete workload my-container-workload
```
