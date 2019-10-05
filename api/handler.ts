import { APIGatewayProxyHandler } from "aws-lambda";
import * as AdmZip from "adm-zip";
import * as mime from "mime-types";
import "source-map-support/register";

const publicUrl = process.env.PUBLIC_URL!;
const bundleFileName = "html-bundle.zip";
const resources = new AdmZip(bundleFileName).getEntries().reduce(
  (map, entry) => {
    map[entry.entryName] = entry;
    return map;
  },
  {} as {
    [name: string]: AdmZip.IZipEntry;
  }
);

const NotFound = { statusCode: 404, body: "Not Found" };
const textTypes = [".css", ".html", ".js", ".json", ".map", ".svg", ".txt"];

const mimeHeader = (name: string) => ({
  headers: {
    "Content-Type": mime.contentType(name) || "application/octet-stream"
  }
});

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
  const resource = resources[requestPath];
  if (!resource) {
    return NotFound;
  }
  const toBase64 = !textTypes.some(ext => requestPath.endsWith(ext));
  return {
    statusCode: 200,
    ...mimeHeader(resource.name),
    body: resource.getData().toString(toBase64 ? "base64" : "utf-8"),
    isBase64Encoded: toBase64
  };
};

export const hello: APIGatewayProxyHandler = async event => {
  return {
    statusCode: 200,
    ...mimeHeader("_.json"),
    body: JSON.stringify(event)
  };
};
