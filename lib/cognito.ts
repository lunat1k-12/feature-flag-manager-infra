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

        // Add a custom domain to the User Pool
        const domain = new cognito.UserPoolDomain(this, 'FeatureFlagDomain', {
            userPool: this.userPool,
            cognitoDomain: {
                domainPrefix: 'feature-flip'
            }
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
                callbackUrls: ['http://localhost:5173/callback'],
                logoutUrls: ['http://localhost:5173/logout']
            },
            supportedIdentityProviders: [
                cognito.UserPoolClientIdentityProvider.COGNITO
            ]
        });

        // We can't directly add UI customization here due to circular dependency
        // Instead, we'll use the UserPool's UI customization settings
        const cfnUserPool = this.userPool.node.defaultChild as cognito.CfnUserPool;
        cfnUserPool.addPropertyOverride('UserPoolAddOns', {
            'AdvancedSecurityMode': 'OFF'
        });

        // For custom login page, we would typically use a resource server or Lambda function
        // to serve the custom HTML/CSS, and point the Cognito domain to it
        // This is beyond the scope of this example, but the domain is set up for it

        // Output the User Pool ID and Client ID
        new cdk.CfnOutput(this, 'UserPoolId', {
            value: this.userPool.userPoolId
        });

        new cdk.CfnOutput(this, 'UserPoolClientId', {
            value: this.userPoolClient.userPoolClientId
        });

        // Output the Cognito domain URL
        new cdk.CfnOutput(this, 'CognitoDomainUrl', {
            value: `https://feature-flip.auth.${this.region}.amazoncognito.com`
        });
    }
}
