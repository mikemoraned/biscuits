# Speculaas

## one-off

Setup namespace, context:

    CLUSTER=minikube # or kops-apps2 etc
    USER=${CLUSTER}-admin
    kubectl config set-context speculaas-${CLUSTER} --cluster=${CLUSTER} --user=${USER}
    kubectl config use-context speculaas-${CLUSTER}
    kubectl apply -f k8s/namespace.yaml
    kubectl config set-context speculaas-${CLUSTER} --namespace=speculaas --cluster=${CLUSTER}

Use docker hub and switch to speculaas-kops context:

    kubectl config use-context speculaas-kops

## Build and push

    export DOCKER_ID_USER="houseofmoran"
    docker login

    docker build -t houseofmoran/speculaas-pieces-finder:16 ./pieces-finder
    docker build -t houseofmoran/speculaas-pieces-view:31 ./pieces-view

    docker push houseofmoran/speculaas-pieces-finder:16
    docker push houseofmoran/speculaas-pieces-view:31

## Define secrets

For Honeycomb go to the [Account Page](https://ui.honeycomb.io/account) and find the Team
API key; we'll use `<API_KEY>` as a placeholder for this below.

Define the secret for use by services:

    kubectl create secret generic honeycomb-api-key --namespace=speculaas --from-literal=HONEYCOMB_KEY=<API_KEY>

## Ingress and services

    kubectl apply -f ./pieces-finder/k8s/service.yaml
    kubectl apply -f ./pieces-view/k8s/service.yaml
    kubectl apply -f ./k8s/ingress.yaml

## Deployments

    kubectl apply -f ./pieces-finder/k8s/deployment.yaml
    kubectl apply -f ./pieces-view/k8s/deployment.yaml
