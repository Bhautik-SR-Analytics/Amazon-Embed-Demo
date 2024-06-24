"use server";

import client from "@/utils/db";

export async function getClientLists() {
  const sql = `select client_id, client_name from ecom_embed_test.master_clients`;
  try {
    const result = await client.query(sql);
    return result.rowCount === 0 ? null : result.rows;
  } catch (e) {
    return null;
  }
}

export async function getReportsOptions(clientId) {
  const sql = `select report_id, report_name from ecom_embed_test.master_reports where client_id = $1`;
  try {
    const result = await client.query(sql, [clientId]);
    return result.rowCount === 0 ? null : result.rows;
  } catch (e) {
    return null;
  }
}
