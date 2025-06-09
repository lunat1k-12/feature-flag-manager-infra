import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

export interface ApiGatewayProps {
  featureFlagLambda: lambda.Function;
  domainName?: string;        // Optional: e.g., 'api.example.com'
  hostedZoneId?: string;      // Optional: Your Route 53 hosted zone ID
  hostedZoneName?: string;    // Optional: e.g., 'example.com'
}

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, apiProps: ApiGatewayProps, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create API Gateway REST API
    let apiOptions: apigateway.RestApiProps = {
      restApiName: 'Feature Flag Service',
      description: 'This service provides access to feature flags',
      deployOptions: {
        stageName: 'prod',
      },
      // Enable CORS
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    };

    // Add domain name configuration if provided
    if (apiProps.domainName && apiProps.hostedZoneId && apiProps.hostedZoneName) {
      // Reference existing hosted zone
      const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
        hostedZoneId: apiProps.hostedZoneId,
        zoneName: apiProps.hostedZoneName,
      });

      // Create ACM certificate
      const certificate = new acm.Certificate(this, 'Certificate', {
        domainName: apiProps.domainName,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      });

      // Add domain name to API options
      apiOptions = {
        ...apiOptions,
        domainName: {
          domainName: apiProps.domainName,
          certificate: certificate,
        }
      };
    }

    const api = new apigateway.RestApi(this, 'FeatureFlagApi', apiOptions);

    // Create a resource and GET method
    const featureFlags = api.root.addResource('feature-flags');

    // Integrate the Lambda function with the API Gateway
    featureFlags.addMethod('GET', new apigateway.LambdaIntegration(apiProps.featureFlagLambda, {
      proxy: true, // Use proxy integration to pass all request data to Lambda
      requestTemplates: {
        'application/json': JSON.stringify({
          apiKey: '$input.params().header.x-api-key',
        })
      }
    }));

    // Add a resource with a path parameter for specific feature flag access
    const featureFlag = featureFlags.addResource('{flagName}');
    featureFlag.addMethod('GET', new apigateway.LambdaIntegration(apiProps.featureFlagLambda, {
      proxy: true,
    }));

    // Create Route 53 A record if domain configuration is provided
    if (apiProps.domainName && apiProps.hostedZoneId && apiProps.hostedZoneName) {
      const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, `HostedZone-${apiProps.domainName}`, {
        hostedZoneId: apiProps.hostedZoneId,
        zoneName: apiProps.hostedZoneName,
      });

      new route53.ARecord(this, 'ApiGatewayAliasRecord', {
        zone: hostedZone,
        recordName: apiProps.domainName,
        target: route53.RecordTarget.fromAlias(
          new targets.ApiGateway(api)
        ),
      });

      // Output the custom domain URL
      new cdk.CfnOutput(this, 'CustomDomainUrl', {
        value: `https://${apiProps.domainName}`,
        description: 'The custom domain URL',
      });
    }

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'The URL of the API Gateway',
    });
  }
}
