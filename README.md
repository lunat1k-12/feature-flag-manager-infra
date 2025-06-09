

# Fixing the "Missing Authentication Token" Error

The error message `{"message":"Missing Authentication Token"}` typically occurs in API Gateway when you're trying to access an endpoint that doesn't exist or when your request is missing required authentication.

## Common Causes and Solutions

### 1. Incorrect URL Path

The most common cause is using an incorrect URL path. Make sure your URL includes:
- The correct domain (`query.featuresflip.com` or the API Gateway URL)
- The stage name (`prod`)
- The resource path (`feature-flags`)

**Correct URL format:**
```
https://query.featuresflip.com/prod/feature-flags
```

or if using the default API Gateway URL:
```
https://{api-id}.execute-api.us-east-1.amazonaws.com/prod/feature-flags
```

### 2. Missing the Stage Name

A very common mistake is forgetting to include the stage name (`prod`) in the URL. The stage name is required in the path.

### 3. Missing Required Authentication

If your API requires authentication (like an API key), make sure to include it:

```bash
curl -X GET https://query.featuresflip.com/prod/feature-flags \
  -H "x-api-key: your-api-key-here"
```

## Corrected curl Commands

Try these corrected commands:

```bash
# Using custom domain
curl -X GET https://query.featuresflip.com/prod/feature-flags

# For a specific feature flag
curl -X GET https://query.featuresflip.com/prod/feature-flags/my-feature-flag

# With API key (if required)
curl -X GET https://query.featuresflip.com/feature-flags \
  -H "x-api-key: dbbdb0c1-302c-49ee-8cc1-dbaa8810bb54" \
  -H "Content-Type: application/json" \
  -G --data-urlencode "environment=production"
```

If you're still getting the error, check the API Gateway console to verify:
1. The API is deployed correctly
2. The custom domain is set up properly
3. The resource paths are configured as expected