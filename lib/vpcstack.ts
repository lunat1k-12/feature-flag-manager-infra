import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";
import {Vpc} from "aws-cdk-lib/aws-ec2";

export class VpcStack extends cdk.Stack {

    readonly vpc: Vpc;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.vpc = new Vpc(this, 'feature-flip-vpc');
    }
}