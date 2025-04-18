#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {DynamoDbStack} from "../lib/dynamodb";
import {CognitoStack} from "../lib/cognito";

const app = new cdk.App();

const props = {
    env: {
        region: 'us-east-1'
    }
};
new DynamoDbStack(app, 'ff-dynamo-db-stack', props);
new CognitoStack(app, 'ff-cognito-stack', props);