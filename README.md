# Serverless with HTML bundle

This is a simple proof of concept to serve HTML from a zip bundle file on AWS Serverless stack that is API Gateway + Lambda.

## Rationale

I think it is a very boring job to deploy such a simple frontend pages into AWS S3 to provide some simple functionalities of a Serverless backend. Full sequence I sufferred in many times, is,

1. Develop and deploy a serverless stack.
2. Develop a simple frontend for that using `create-react-app`.
3. Build it and upload it to AWS S3 Bucket.
4. Set CORS headers in the backend to allow the frontend's requests.
5. Set CloudFront to serve the frontend pages via HTTPS.

These frontend I made is quite simple and small, that is, there is no problem such as performance and pricing that serving them via API Gateway. So this PoC shows how to include a zip bundle of HTML (and its friends) into a serverless deployment and how to serve it on AWS API Gateway and AWS Lambda.

## Walkthrough

### Make a bundle of the frontend

```bash
cd front && \
  yarn && \
  yarn build && \
  yarn bundle
```

That is,

1. Install dependencies.
2. Build a HTML result using a build script from `react-scripts`.
3. Zip them all into a `html-bundle.zip` in `api` directory.

### Deploy the backend

```bash
cd api && \
  yarn && \
  yarn deploy
```

That is,

1. Install dependencies.
2. Deploy all of them using the `deploy` command from Serverless framework.

Of course, `AWS credentials` should be set in this environment.

Now, we can check the frontend pages from the endpoint of `serve` function.
