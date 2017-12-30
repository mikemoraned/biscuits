# Kops

## Requirements

* a working `awscli` install

## One-off setup

### Tools

following https://github.com/kubernetes/kops/blob/master/docs/install.md:

    brew install kops

### Users/Groups

following https://github.com/kubernetes/kops/blob/master/docs/aws.md run following commands:

    aws iam create-group --group-name kops
    
    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess --group-name kops
    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/AmazonRoute53FullAccess --group-name kops
    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess --group-name kops
    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/IAMFullAccess --group-name kops
    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/AmazonVPCFullAccess --group-name kops
    
    aws iam create-user --user-name kops
    
    aws iam add-user-to-group --user-name kops --group-name kops

### Profile for kops

We don't explicitly set local env's for secret keys, but rather create a profile:

    aws iam create-access-key --user-name kops # keep the output of this in your terminal
    
Add a section to ~/.aws/credentials like:

    [kops]
    aws_access_key_id = <20-char AccessKeyId>
    aws_secret_access_key = <40-char SecretAccessKey>

### State bucket

create a bucket for state store

    export STATE_STORE_BUCKET=houseofmoran-com-kops-state-store
    
    aws s3api create-bucket --bucket $STATE_STORE_BUCKET --region us-east-1
    aws s3api put-bucket-versioning --bucket $STATE_STORE_BUCKET --versioning-configuration Status=Enabled

### SSH

Only needed if I have no ssh keys:

    ssh-keygen

## Setup a cluster

Ensure choices from one-off setup are used

    export AWS_PROFILE=kops
    export STATE_STORE_BUCKET=houseofmoran-com-kops-state-store
    
Names for this cluster

    export NAME=testcluster.k8s.local
    export KOPS_STATE_STORE=s3://$STATE_STORE_BUCKET

Create cluster:
    
    kops create cluster --zones us-west-2a ${NAME}
    kops update cluster ${NAME} --yes
    
... then wait a few minutes to check if it is working (5 mins or more)

    kops validate cluster
    kubectl get nodes --show-labels
    
... note that following doesn't seem to work

    ssh -i ~/.ssh/id_rsa admin@api.${NAME}
    
... however if you find the public dns of the master node then it works:

    export MASTER=...
    ssh -i ~/.ssh/id_rsa admin@${MASTER}
    
## Delete the cluster

    kops delete cluster --name ${NAME} # dry run
    kops delete cluster --name ${NAME} --yes # for real

# Speculaas

## Shared

Setup namespace, context:

    kubectl apply -f k8s/namespace.yaml
    kubectl config set-context speculaas-kops --namespace=speculaas --cluster=${NAME} --user=${NAME}

Use docker hub and switch to speculaas-kops context:

    export DOCKER_ID_USER="houseofmoran"
    docker login
    kubectl config use-context speculaas-kops
    
## Build, push and start piece-finder

    docker build -t speculaas-pieces-finder ./pieces-finder
    docker tag speculaas-pieces-finder houseofmoran/speculaas-pieces-finder:3
    docker push houseofmoran/speculaas-pieces-finder:2
    kubectl apply -f ./pieces-finder/k8s/deployment.yaml
    kubectl apply -f ./pieces-finder/k8s/service.yaml

## Build, push and start piece-view

    docker build -t speculaas-pieces-view ./pieces-view
    docker tag speculaas-pieces-view houseofmoran/speculaas-pieces-view:4
    docker push houseofmoran/speculaas-pieces-view:3
    kubectl apply -f ./pieces-view/k8s/deployment.yaml
    kubectl apply -f ./pieces-view/k8s/service.yaml

# Access

## pieces-finder

    kubectl port-forward $(kubectl get pod -l 'app=pieces-finder' | grep -v NAME | cut -f1 -d' ') 15000:5000

This is then available at http://127.0.0.1:15000/    

## pieces-view

    kubectl port-forward $(kubectl get pod -l 'app=pieces-view' | grep -v NAME | cut -f1 -d' ') 13000:3000

This is then available at http://127.0.0.1:13000/