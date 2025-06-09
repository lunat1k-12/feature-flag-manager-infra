import * as cdk from "aws-cdk-lib";
import * as s3 from 'aws-cdk-lib/aws-s3';
import {Construct} from "constructs";
import {RemovalPolicy} from "aws-cdk-lib";

export class S3Stack extends cdk.Stack {
    readonly bucket:s3.Bucket;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create an S3 bucket
        this.bucket = new s3.Bucket(this, 'FfLambdaJarBucket', {
            versioned: true, // Enable versioning
            removalPolicy: RemovalPolicy.DESTROY, // Auto-delete bucket on stack removal
            autoDeleteObjects: true, // Auto-delete objects on removal
        });
    }
}