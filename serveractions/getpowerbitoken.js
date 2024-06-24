"use server";

import { auth } from "@/utils/auth";
import { PublicClientApplication, ConfidentialClientApplication } from "@azure/msal-node";

const config = {
  AUTHENTICATION_MODE: process.env.AUTHENTICATION_MODE,
  CLIENT_ID: process.env.CLIENT_ID,
  AUTHORITY_URL: process.env.AUTHORITY_URL,
  POWER_BI_USER: process.env.POWER_BI_USER,
  POWER_BI_PASS: process.env.POWER_BI_PASS,
  SCOPE_BASE: process.env.SCOPE_BASE,
  TENANT_ID: process.env.TENANT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
};

// MSAL Initialization
const pca = new PublicClientApplication({
  auth: {
    clientId: config.CLIENT_ID,
    authority: config.AUTHORITY_URL,
  },
});

const cca = new ConfidentialClientApplication({
  auth: {
    clientId: config.CLIENT_ID,
    authority: config.AUTHORITY_URL.replace("organizations", config.TENANT_ID),
    clientSecret: config.CLIENT_SECRET,
  },
});

export default async function getPowerBiToken() {
  const curruentUser = await auth();

  if (!curruentUser) {
    return { success: false, msg: "You are not authorised." };
  }
  try {
    let response;

    if (config.AUTHENTICATION_MODE.toLowerCase() === "masteruser") {
      const accounts = await pca.getTokenCache().getAllAccounts();

      if (accounts.length > 0) {
        response = await pca.acquireTokenSilent({
          account: accounts[0],
          scopes: [config.SCOPE_BASE],
        });
      } else {
        response = await pca.acquireTokenByUsernamePassword({
          username: config.POWER_BI_USER,
          password: config.POWER_BI_PASS,
          scopes: [config.SCOPE_BASE],
        });
      }
    } else if (config.AUTHENTICATION_MODE.toLowerCase() === "serviceprincipal") {
      response = await cca.acquireTokenByClientCredential({
        scopes: [config.SCOPE_BASE],
      });
    }

    return { success: true, accessToken: response.accessToken, msg: "token generated sucessfully." };
  } catch (error) {
    return { success: false, msg: `Error retrieving Access token:", ${error.message}` };
  }
}
