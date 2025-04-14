#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {DynamoDbStack} from "../lib/dynamodb";

const app = new cdk.App();

new DynamoDbStack(app, 'ff-dynamo-db-stack', {
    env: {
        region: 'us-east-1'
    }
});