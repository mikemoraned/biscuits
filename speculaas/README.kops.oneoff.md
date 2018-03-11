# Requirements

* a working `awscli` install

## Tools

following https://github.com/kubernetes/kops/blob/master/docs/install.md:

    brew install kops

## Users/Groups

following https://github.com/kubernetes/kops/blob/master/docs/aws.md run following commands:

    aws iam create-group --group-name kops
    
    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess --group-name kops
    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/AmazonRoute53FullAccess --group-name kops
    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess --group-name kops
    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/IAMFullAccess --group-name kops
    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/AmazonVPCFullAccess --group-name kops
    
    aws iam create-user --user-name kops
    
    aws iam add-user-to-group --user-name kops --group-name kops

## Profile for kops

We don't explicitly set local env's for secret keys, but rather create a profile:

    aws iam create-access-key --user-name kops # keep the output of this in your terminal
    
Add a section to ~/.aws/credentials like:

    [kops]
    aws_access_key_id = <20-char AccessKeyId>
    aws_secret_access_key = <40-char SecretAccessKey>

## State bucket

create a bucket for state store

    export STATE_STORE_BUCKET=houseofmoran-com-kops-state-store
    
    aws s3api create-bucket --bucket $STATE_STORE_BUCKET --region us-east-1
    aws s3api put-bucket-versioning --bucket $STATE_STORE_BUCKET --versioning-configuration Status=Enabled

## SSH

Only needed if I have no ssh keys:

    ssh-keygen
