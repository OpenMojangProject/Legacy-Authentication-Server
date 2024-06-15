import { generateKeys, getPublicKey } from "@/utils";

interface AuthlibConfig {
  skinDomains: string[];
  meta: {
    implementationName: string;
    implementationVersion: string;
    serverName: string;
    "feature.non_email_login"?: boolean;
  };
  signaturePublickey?: string;
}

interface MojangConfig {
  Status: string;
  "Runtime-Mode": string;
  "Application-Author": string;
  "Application-Description": string;
  "Specification-Version": string;
  "Application-Name": string;
  "Implementation-Version": string;
  "Application-Owner": string;
}

export async function GET(request: Request) {
  let data;

  const authlibConfig: AuthlibConfig = await import(
    "../../../config/authlib.json"
  ).then((module) => module.default);

  const mojangConfig: MojangConfig = await import(
    "../../../config/mojang.json"
  ).then((module) => module.default);

  if (
    process.env.API_MODE === "authlib" ||
    process.env.API_MODE === "combined"
  ) {
    generateKeys();

    authlibConfig.signaturePublickey = getPublicKey();

    if (process.env.FEATURE_NON_EMAIL_LOGIN === "true") {
      authlibConfig.meta["feature.non_email_login"] = true;
    }
  }

  if (process.env.API_MODE === "mojang") {
    data = mojangConfig;
  } else if (process.env.API_MODE === "authlib") {
    data = authlibConfig;
  } else {
    data = { ...mojangConfig, ...authlibConfig };
  }

  return Response.json(data);
}
