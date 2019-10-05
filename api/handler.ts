import { APIGatewayProxyHandler } from "aws-lambda";
import * as AdmZip from "adm-zip";
import * as path from "path";
import "source-map-support/register";

const publicUrl = process.env.PUBLIC_URL!;

export const hello: APIGatewayProxyHandler = async event => {
  return {
    statusCode: 200,
    ...mimeHeader("_.json"),
    body: JSON.stringify(event)
  };
};

const htmlBundle = new AdmZip("html-bundle.zip").getEntries();
const NotFound = { statusCode: 404, body: "Not Found" };

const translateToBundlePath = (requestUrl: string) => {
  let maybe = requestUrl.startsWith(publicUrl)
    ? requestUrl.substr(publicUrl.length)
    : requestUrl;
  while (maybe.startsWith("/")) {
    maybe = maybe.substr(1);
  }
  return maybe || "index.html";
};

export const serve: APIGatewayProxyHandler = async event => {
  if (!event.path) {
    return NotFound;
  }

  const requestPath = translateToBundlePath(event.path);
  console.log(requestPath);

  const resource = htmlBundle.find(each => each.entryName === requestPath);
  if (!resource) {
    return NotFound;
  }
  const toBase64 = !isKnownTextType(resource.name);
  return {
    statusCode: 200,
    ...mimeHeader(resource.name),
    body: resource.getData().toString(toBase64 ? "base64" : "utf-8"),
    isBase64Encoded: toBase64
  };
};

const isKnownTextType = (name: string) =>
  knownTextTypes.includes(path.extname(name.toLowerCase()));
const knownTextTypes = [
  ".html",
  ".js",
  ".json",
  ".css",
  ".svg",
  ".txt",
  ".map"
];
const mimeTypes: { [ext: string]: string } = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".txt": "plain/txt",
  ".ico": "image/x-icon	"
};

const mimeHeader = (name: string) => ({
  headers: {
    "Content-Type":
      mimeTypes[path.extname(name.toLowerCase())] || "application/octet-stream"
  }
});
