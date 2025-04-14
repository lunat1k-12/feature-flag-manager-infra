import * as cdk from "aws-cdk-lib";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import {Construct} from "constructs";
import {RemovalPolicy} from "aws-cdk-lib";

export class DynamoDbStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const envTable = new dynamodb.Table(this, 'Environment', {
            tableName: 'Environment',
            partitionKey: { name: 'name', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // On-demand pricing
            removalPolicy: RemovalPolicy.DESTROY, // Auto-delete table on stack removal
        });

        const apiTable = new dynamodb.Table(this, 'ApiKeyTable', {
            tableName: 'EnvApiKey',
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            sortKey: {name: 'EnvName', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // On-demand pricing
            removalPolicy: RemovalPolicy.DESTROY, // Auto-delete table on stack removal
        });

        const ffTable = new dynamodb.Table(this, 'FeatureFlagTable', {
            tableName: 'FeatureFlag',
            partitionKey: { name: 'FeatureName', type: dynamodb.AttributeType.STRING },
            sortKey: {name: 'EnvName', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // On-demand pricing
            removalPolicy: RemovalPolicy.DESTROY, // Auto-delete table on stack removal
        });
    }
}