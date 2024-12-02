#!/bin/bash
aws cloudformation update-stack \
    --stack-name online-store-infra \
    --template-body file://stack-eu-central-1.yaml \
    --parameters $(tr '\n' ' ' < ./parameters.cfn) \
    --capabilities CAPABILITY_NAMED_IAM \
    --region eu-central-1
aws cloudformation update-stack \
    --stack-name online-store-infra \
    --template-body file://stack-us-east-1.yaml \
    --region us-east-1
