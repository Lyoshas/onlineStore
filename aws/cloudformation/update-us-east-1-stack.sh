#!/bin/bash
aws cloudformation update-stack \
    --stack-name online-store-infra \
    --template-body file://stack-us-east-1.yaml \
    --region us-east-1
