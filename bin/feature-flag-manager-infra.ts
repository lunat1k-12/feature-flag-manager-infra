#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {DynamoDbStack} from "../lib/dynamodb";
import {CognitoStack} from "../lib/cognito";
import {S3Stack} from "../lib/s3stack";
import {LambdaStack, LambdaProps} from "../lib/lambda";
import {VpcStack} from "../lib/vpcstack";

const app = new cdk.App();

const props = {
    env: {
        region: 'us-east-1'
    }
};
const vpcStack = new VpcStack(app, 'ff-vpc-stack', props);
const dynamoDbStack = new DynamoDbStack(app, 'ff-dynamo-db-stack', props);
new CognitoStack(app, 'ff-cognito-stack', props);
const s3Stack = new S3Stack(app, 'ff-s3-stack', props);

const lambdaProps: LambdaProps = { apiTable: dynamoDbStack.apiTable,
    bucket: s3Stack.bucket,
    vpc:
    vpcStack.vpc
};

new LambdaStack(app, 'ff-lambda-stack', lambdaProps, props);