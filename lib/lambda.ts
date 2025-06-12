import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import {Vpc} from "aws-cdk-lib/aws-ec2";

export interface LambdaProps {
    apiTable:dynamodb.Table,
    featureFlagsTable:dynamodb.Table,
    accountUsage:dynamodb.Table,
    bucket:s3.Bucket,
    vpc:Vpc
}

export class LambdaStack extends cdk.Stack {
    readonly ffLambda: lambda.Function;

    constructor(scope: Construct, id: string, lambdaProps:LambdaProps, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create a Log Group for the Lambda function
        const logGroup = new logs.LogGroup(this, 'ААLambdaLogGroup', {
            logGroupName: `/aws/lambda/FFLambda`, // Custom Log Group name
            retention: logs.RetentionDays.ONE_WEEK, // Optional: Set retention period
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Optional: Remove log group on stack deletion
        });

        const ffLambda = new lambda.Function(this, 'FFLambda', {
            runtime: lambda.Runtime.JAVA_21,
            handler: 'com.ech.ff.handler.FeatureFlagQueryHandler::handleRequest',
            code: lambda.Code.fromBucket(lambdaProps.bucket, 'FeatureFlagLambda-1.0-SNAPSHOT.jar'),
            memorySize: 512,
            timeout: cdk.Duration.seconds(30),
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
            logGroup: logGroup,
            vpc: lambdaProps.vpc
        });

        logGroup.grantWrite(ffLambda);

        ffLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ['cloudwatch:PutMetricData'],
            resources: ['*'],
        }));

        lambdaProps.apiTable.grantReadData(ffLambda);
        lambdaProps.featureFlagsTable.grantReadData(ffLambda);
        lambdaProps.accountUsage.grantFullAccess(ffLambda);

        // Assign the Lambda function to the class property
        this.ffLambda = ffLambda;
    }
}
