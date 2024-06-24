"use server";

import getPowerBiToken from "@/serveractions/getpowerbitoken";
import { auth } from "@/utils/auth";
import { getUsersReports } from "./actions";

export async function getEmbedParamsForSingleReport(workspace_id, report_id, additional_dataset_id = "") {
  const curruentUser = await auth();

  if (!curruentUser) {
    return { success: false, msg: "You are not authorised." };
  }

  try {
    const report_url = `https://api.powerbi.com/v1.0/myorg/groups/${workspace_id}/reports/${report_id}`;

    const token = await getPowerBiToken();

    if (!token.success) {
      return { success: false, message: `Error while retrieving token` };
    }

    const api_response = await fetch(report_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token.accessToken,
      },
    });

    if (!api_response.ok) {
      return { success: false, message: `Error while retrieving Embed token: ${api_response.statusText}`, details: await api_response.text() };
    }

    const api_response_json = await api_response.json();

    const report = {
      id: api_response_json["id"],
      name: api_response_json["name"],
      embedUrl: api_response_json["embedUrl"],
    };

    const dataset_ids = [api_response_json["datasetId"]];

    if (additional_dataset_id) {
      dataset_ids.push(additional_dataset_id);
    }

    // You will need to implement the logic for `get_embed_token_for_single_report_single_workspace`
    const embed_token = await getEmbedTokenForSingleReportSingleWorkspace(report_id, dataset_ids, workspace_id);

    const embedConfig = {
      success: true,
      data: {
        tokenId: embed_token.tokenId,
        token: embed_token.token,
        tokenExpiry: embed_token.expiration,
        report: [report],
      },
      msg: "Report successfully created.",
    };

    return embedConfig;
  } catch (error) {
    return { success: false, message: `Error while retrieving Embed token: ${error.message}` };
  }
}

async function getEmbedTokenForSingleReportSingleWorkspace(report_id, dataset_ids, target_workspace_id) {
  try {
    const request_body = {
      datasets: [],
      reports: [],
      targetWorkspaces: [],
    };

    dataset_ids.forEach((dataset_id) => {
      request_body.datasets.push({ id: dataset_id });
    });

    request_body.reports.push({ id: report_id });

    if (target_workspace_id) {
      request_body.targetWorkspaces.push({ id: target_workspace_id });
    }

    const embed_token_api = "https://api.powerbi.com/v1.0/myorg/GenerateToken";

    const token = await getPowerBiToken();

    if (!token.success) {
      return { success: false, message: `Error while retrieving token` };
    }

    const api_response = await fetch(embed_token_api, {
      method: "POST",
      body: JSON.stringify(request_body),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token.accessToken,
      },
    });

    if (!api_response.ok) {
      return { success: false, message: `Error while retrieving Embed token: ${api_response.statusText}` };
    }

    const apiResponseJson = await api_response.json();
    return { success: false, tokenId: apiResponseJson["tokenId"], token: apiResponseJson["token"], expiration: apiResponseJson["expiration"] };
  } catch (error) {
    console.log(error);
    return { success: false, message: `Error while retrieving Embed token: ${error.message}` };
  }
}

async function getReportData(workspace_id, report_id, token) {
  const report_url = `https://api.powerbi.com/v1.0/myorg/groups/${workspace_id}/reports/${report_id}`;

  const api_response = await fetch(report_url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });

  if (!api_response.ok) {
    return { success: false, message: `Error while retrieving Embed token: ${api_response.statusText}`, details: await api_response.text() };
  }

  const response = await api_response.json();

  return response;
}

export async function getEmbedParamsForMultipleReports(additional_dataset_id = "") {
  const curruentUser = await auth();

  if (!curruentUser) {
    return { success: false, msg: "You are not authorised." };
  }

  const userReports = await getUsersReports();
  if (userReports) {
    const reportIds = [...new Set(userReports.map((report) => report.power_bi_report_id))];
    const workspaceIds = [...new Set(userReports.map((report) => report.power_bi_workspace_id))];

    try {
      const token = await getPowerBiToken();

      if (!token.success) {
        return { success: false, message: `Error while retrieving token` };
      }

      const reports = [];
      const datasetIds = [];

      const promises = userReports.map((report) => getReportData(report.power_bi_workspace_id, report.power_bi_report_id, token.accessToken));

      await Promise.all(promises)
        .then((results) => {
          // All promises resolved successfully
          console.log("All reports fetched:");
          results.forEach((result, index) => {
            reports.push({
              id: result["id"],
              name: result["name"],
              embedUrl: result["embedUrl"],
              reportType: userReports[index].report_name,
            });
            if (!datasetIds.includes(result["datasetId"])) {
              datasetIds.push(result["datasetId"]);
            }
          });
        })
        .catch((error) => {
          // One or more promises rejected
          console.error("One or more reports failed to fetch:", error);
        });

      if (additional_dataset_id) {
        datasetIds.push(additional_dataset_id);
      }

      // You will need to implement the logic for `get_embed_token_for_single_report_single_workspace`
      const embed_token = await getEmbedTokenForMultipleReportSingleWorkspace(reportIds, datasetIds, workspaceIds);

      const embedConfig = {
        success: true,
        data: {
          tokenId: embed_token.tokenId,
          token: embed_token.token,
          tokenExpiry: embed_token.expiration,
          reports: reports,
        },
        msg: "Report successfully created.",
      };
      return embedConfig;
    } catch (error) {
      return { success: false, message: `Error while retrieving Embed token: ${error.message}` };
    }
  } else {
    return { success: false, message: `No reports associalted with this user.` };
  }
}

async function getEmbedTokenForMultipleReportSingleWorkspace(report_ids, dataset_ids, target_workspace_ids) {
  try {
    const request_body = {
      datasets: [],
      reports: [],
      targetWorkspaces: [],
    };

    dataset_ids.forEach((dataset_id) => {
      request_body.datasets.push({ id: dataset_id });
    });

    report_ids.forEach((report_id) => {
      request_body.reports.push({ id: report_id });
    });

    target_workspace_ids.forEach((target_workspace_id) => {
      request_body.targetWorkspaces.push({ id: target_workspace_id });
    });

    const embed_token_api = "https://api.powerbi.com/v1.0/myorg/GenerateToken";

    const token = await getPowerBiToken();

    if (!token.success) {
      return { success: false, message: `Error while retrieving token` };
    }

    const api_response = await fetch(embed_token_api, {
      method: "POST",
      body: JSON.stringify(request_body),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token.accessToken,
      },
    });

    if (!api_response.ok) {
      return { success: false, message: `Error while retrieving Embed token: ${api_response.statusText}` };
    }

    const apiResponseJson = await api_response.json();

    return { success: false, tokenId: apiResponseJson["tokenId"], token: apiResponseJson["token"], expiration: apiResponseJson["expiration"] };
  } catch (error) {
    console.log(error);

    return { success: false, message: `Error while retrieving Embed token: ${error.message}` };
  }
}
