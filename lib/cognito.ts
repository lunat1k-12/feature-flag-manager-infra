import * as cdk from "aws-cdk-lib";
import {RemovalPolicy} from "aws-cdk-lib";
import * as cognito from 'aws-cdk-lib/aws-cognito';
import {Construct} from "constructs";

export class CognitoStack extends cdk.Stack {
    public readonly userPool: cognito.UserPool;
    public readonly userPoolClient: cognito.UserPoolClient;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create a Cognito User Pool
        this.userPool = new cognito.UserPool(this, 'FeatureFlagUserPool', {
            userPoolName: 'feature-flag-user-pool',
            selfSignUpEnabled: true,
            signInAliases: {
                email: true,
                username: true
            },
            autoVerify: {
                email: true
            },
            standardAttributes: {
                email: {
                    required: true,
                    mutable: true
                },
                givenName: {
                    required: true,
                    mutable: true
                },
                familyName: {
                    required: true,
                    mutable: true
                }
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: true
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            removalPolicy: RemovalPolicy.DESTROY
        });

        // Create a User Pool Client
        this.userPoolClient = new cognito.UserPoolClient(this, 'FeatureFlagUserPoolClient', {
            userPool: this.userPool,
            userPoolClientName: 'feature-flag-app-client',
            generateSecret: false,
            authFlows: {
                userPassword: true,
                userSrp: true,
                adminUserPassword: true
            },
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                    implicitCodeGrant: true
                },
                scopes: [
                    cognito.OAuthScope.EMAIL,
                    cognito.OAuthScope.OPENID,
                    cognito.OAuthScope.PROFILE
                ],
                callbackUrls: ['http://localhost:3000/callback'],
                logoutUrls: ['http://localhost:3000/logout']
            }
        });

        // Output the User Pool ID and Client ID
        new cdk.CfnOutput(this, 'UserPoolId', {
            value: this.userPool.userPoolId
        });

        new cdk.CfnOutput(this, 'UserPoolClientId', {
            value: this.userPoolClient.userPoolClientId
        });
    }
}
