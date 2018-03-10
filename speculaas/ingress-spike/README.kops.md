# Kops

## Requirements

Assume that "kops" is setup to be able to make changes in AWS on your behalf

    export AWS_PROFILE=kops

### State bucket

Assume we have a bucket for state store

    export STATE_STORE_BUCKET=houseofmoran-com-kops-state-store
    
## Setup a cluster
    
Choices for this cluster

    export NAME=ingress-spike.houseofmoran.io
    export KOPS_STATE_STORE=s3://$STATE_STORE_BUCKET
    export TOPOLOGY=private
    export NETWORKING=flannel-vxlan
    export NODE_SIZE=t2.small
    export SUBNET=us-west-2a

Create cluster:
    
    kops create cluster --zones ${SUBNET} ${NAME} --topology ${TOPOLOGY} --networking ${NETWORKING} \
    --node-size ${NODE_SIZE} --bastion
    kops update cluster ${NAME} --yes

Setup context:

    kubectl config set-context ingress-spike --cluster=${NAME} --user=${NAME}
    kubectl config use-context ingress-spike
    
... then wait a few minutes to check if it is working (5 mins or more)

    watch -n 30 kops validate cluster
    kubectl get nodes --show-labels

## kube proxy

Start kube proxy so that you can access internal services etc from local machine

    export PROXY_PORT=8002
    kubectl proxy --port=${PROXY_PORT} &
    
(PROXY_PORT should be free on localhost)

## Dumping config

    kops get --name $NAME -o yaml > $NAME.spec.yaml

## Deleting the cluster

    kops delete cluster --name ${NAME} # dry run
    kops delete cluster --name ${NAME} --yes # for real
    
## Bastion access

    ssh -A -i ~/.ssh/id_rsa admin@bastion.${NAME}

## Useful Addons 

### Monitoring

    mkdir -p addons/monitoring-standalone
    curl https://raw.githubusercontent.com/kubernetes/kops/master/addons/monitoring-standalone/v1.7.0.yaml > \
    addons/monitoring-standalone/v1.7.0.yaml
    kubectl create -f addons/monitoring-standalone/v1.7.0.yaml
    
### Dashboard

    mkdir -p addons/kubernetes-dashboard
    curl https://raw.githubusercontent.com/kubernetes/kops/master/addons/kubernetes-dashboard/v1.8.1.yaml > \
    addons/kubernetes-dashboard/v1.8.1.yaml 
    kubectl create -f addons/kubernetes-dashboard/v1.8.1.yaml
    
Based on https://github.com/kubernetes/dashboard/wiki/Accessing-Dashboard---1.7.X-and-above, the ui can then be
accessed via:

    open http://localhost:${PROXY_PORT}/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/

This will ask for a "Token", which you can get from:

    kops get secrets kube --type secret -oplaintext

## Setup ingress

### Ingress addon

    mkdir -p addons/ingress-nginx
    curl https://raw.githubusercontent.com/kubernetes/kops/master/addons/ingress-nginx/v1.6.0.yaml > \
    addons/ingress-nginx/v1.6.0.yaml
    kubectl create -f addons/ingress-nginx/v1.6.0.yaml
    
### External DNS
    
Note: following requires assigning the same IAM permissions to all nodes; https://github.com/jtblin/kube2iam may
be a better way to restrict this in the future

    kops edit cluster ${NAME}

Add following under "additionalPolicies", or add at end under "spec" (replace ZONE_ID with route 53 Zone Id that
NAME belongs to)

    additionalPolicies:
      node: |
        [
          {
            "Effect": "Allow",
            "Action": ["route53:ChangeResourceRecordSets"],
            "Resource": ["arn:aws:route53:::hostedzone/ZEUYT225I800P"]
          },
          {
            "Effect": "Allow",
            "Action": ["route53:ListHostedZones","route53:ListResourceRecordSets"],
            "Resource": ["*"]
          }
        ]
      
Then see the changes and apply them

    kops update cluster ${NAME}
    kops update cluster ${NAME} --yes
    kops rolling-update cluster ${NAME} # there should be no changes required, but in-case there are, do following
    kops rolling-update cluster ${NAME} --yes

Install the [ExternalDNS](https://github.com/kubernetes-incubator/external-dns/blob/master/docs/tutorials/aws.md) pod

    kubectl apply -f externalDNS.yaml
    
## Use ingress 

### echoserver

Deploy "echoserver" and add a service

    kubectl apply -f deployment.yaml
    kubectl apply -f service.yaml
    
Check service is available via kube proxy

    open http://localhost:${PROXY_PORT}/api/v1/namespaces/default/services/http:echoserver:/proxy/

Create an ingress for it

    kubectl apply -f ingress.yaml
    
Now open the expected URL

    open http://ingress-spike-echoserver.houseofmoran.io/

### speculaas

Apply speculaas setup from parent

    kubectl apply -f ../k8s/namespace.yaml
    kubectl apply -f ../pieces-finder/k8s/deployment.yaml
    kubectl apply -f ../pieces-finder/k8s/service.yaml
    kubectl apply -f ../pieces-view/k8s/deployment.yaml
    kubectl apply -f ../pieces-view/k8s/service.yaml

Create an ingress for it

    kubectl apply -f speculaas-ingress.yaml
    
Now open the expected URL

    open http://speculaas-ingress.houseofmoran.io/
