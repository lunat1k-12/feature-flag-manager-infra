import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CognitoStack } from '../lib/cognito';
import { DynamoDbStack } from '../lib/dynamodb';

test('Cognito User Pool Created', () => {
  // GIVEN
  const app = new cdk.App();

  // WHEN
  const stack = new CognitoStack(app, 'TestCognitoStack', {
    env: { region: 'us-east-1' }
  });

  // THEN
  const template = Template.fromStack(stack);

  // Verify User Pool is created
  template.resourceCountIs('AWS::Cognito::UserPool', 1);
  template.hasResourceProperties('AWS::Cognito::UserPool', {
    UserPoolName: 'feature-flag-user-pool',
    AutoVerifiedAttributes: ['email'],
    Policies: {
      PasswordPolicy: {
        MinimumLength: 8,
        RequireLowercase: true,
        RequireUppercase: true,
        RequireNumbers: true,
        RequireSymbols: true
      }
    }
  });

  // Verify User Pool Client is created
  template.resourceCountIs('AWS::Cognito::UserPoolClient', 1);
  template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
    ClientName: 'feature-flag-app-client',
    GenerateSecret: false,
    ExplicitAuthFlows: [
      'ALLOW_USER_PASSWORD_AUTH',
      'ALLOW_ADMIN_USER_PASSWORD_AUTH',
      'ALLOW_USER_SRP_AUTH',
      'ALLOW_REFRESH_TOKEN_AUTH'
    ],
    SupportedIdentityProviders: ['COGNITO']
  });

  // Verify User Pool Domain is created
  template.resourceCountIs('AWS::Cognito::UserPoolDomain', 1);
  template.hasResourceProperties('AWS::Cognito::UserPoolDomain', {
    Domain: 'feature-flip'
  });
});

test('DynamoDB Tables Created', () => {
  // GIVEN
  const app = new cdk.App();

  // WHEN
  const stack = new DynamoDbStack(app, 'TestDynamoDbStack', {
    env: { region: 'us-east-1' }
  });

  // THEN
  const template = Template.fromStack(stack);

  // Verify tables are created
  template.resourceCountIs('AWS::DynamoDB::Table', 3);

  // Verify Environment table
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    TableName: 'Environment',
    KeySchema: [
      {
        AttributeName: 'name',
        KeyType: 'HASH'
      }
    ]
  });
});
