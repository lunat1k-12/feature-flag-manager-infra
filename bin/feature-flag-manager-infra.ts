#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {DynamoDbStack} from "../lib/dynamodb";
import {CognitoStack} from "../lib/cognito";
import {S3Stack} from "../lib/s3stack";
import {LambdaStack, LambdaProps} from "../lib/lambda";
import {VpcStack} from "../lib/vpcstack";
import {ApiGatewayStack, ApiGatewayProps} from "../lib/apigateway";

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

const lambdaProps: LambdaProps = { 
    apiTable: dynamoDbStack.apiTable,
    bucket: s3Stack.bucket,
    vpc: vpcStack.vpc
};

const lambdaStack = new LambdaStack(app, 'ff-lambda-stack', lambdaProps, props);

// Create API Gateway Stack
const apiProps: ApiGatewayProps = {
    featureFlagLambda: lambdaStack.ffLambda,
    domainName: 'query.featuresflip.com',
    hostedZoneName: 'featuresflip.com',
    hostedZoneId: 'Z02500962O3BV3MD810W0'
};

new ApiGatewayStack(app, 'ff-api-gateway-stack', apiProps, props);
