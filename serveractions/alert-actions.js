"use server";

import { auth } from "@/utils/auth";
import client from "@/utils/db";

export async function getAllAlertsFromDb() {
    const currentUser = await auth();

    if (!currentUser) {
        return { success: false, msg: "You are not authorised to view alert." };
    }
    const sql = `SELECT * FROM ecom_embed_test.alert_configurations WHERE client_id = $1 ORDER BY id;`;
    try {
        const result = await client.query(sql, [currentUser.client_id]);
        return result.rows?.length ? result.rows : [];
    } catch (error) {
        return null;
    }
}

export async function getAllAlertsHistoryFromDb() {
    const currentUser = await auth();

    if (!currentUser) {
        return { success: false, msg: "You are not authorised to view alert." };
    }
    // const sql = `SELECT * FROM ecom_embed_test.alert_history WHERE client_id = $1 ORDER BY id;`;
    const sql = `SELECT ah.*, a.alert_name, a.metric, a.value, a.condition FROM ecom_embed_test.alert_history as ah INNER JOIN ecom_embed_test.alert_configurations as a ON a.id = ah.alert_id WHERE ah.client_id = $1 ORDER BY ah.id;`;
    try {
        const result = await client.query(sql, [currentUser.client_id]);
        return result.rows?.length ? result.rows : [];
    } catch (error) {
        return null;
    }
}

export async function addAlertToDb(data) {
    const currentUser = await auth();

    if (!currentUser) {
        return { success: false, msg: "You are not authorised to create alert." };
    }
    const { alert_type, alert_name, metric, condition, value, frequency, destination_platform } = data;

    try {
        const sql = `
          INSERT INTO ecom_embed_test.alert_configurations (client_id, alert_type, alert_name, metric, condition, value, frequency, destination_platform, created_by, modified_by) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
          RETURNING *`;
        const result = await client.query(sql, [currentUser.client_id, alert_type, alert_name, metric, condition, value, frequency, destination_platform, currentUser.id, currentUser.id]);
        if (result.rows[0]) {
            return { success: true, msg: "Alert added successfully." };
        } else {
            return { success: false, msg: "Alert not added." };
        }
    } catch (error) {
        console.log(error);
    }
    return { success: false, msg: "Alert not added." };
}

export async function updateAlertInDb(data) {
    const curruentUser = await auth();

    if (!curruentUser) {
        return { success: false, msg: "You are not authorised to update user." };
    }

    let newAlert = data;
    const { id, alert_type, alert_name, metric, condition, value, frequency, destination_platform } = newAlert;

    if (id) {
        const existingDataSql = `SELECT id, client_id, alert_type, alert_name, metric, condition, value, frequency, destination_platform FROM ecom_embed_test.alert_configurations where id = $1`;
        const getAlert = await client.query(existingDataSql, [id]);

        if (getAlert.rows[0]) {
            newAlert = {
                ...getAlert.rows[0],
                ...data,
            };
            const updateSql = `UPDATE ecom_embed_test.alert_configurations set alert_type = $2, alert_name = $3, metric = $4, condition = $5, value = $6, frequency = $7, destination_platform = $8, modified_on = $9, modified_by = $10
    where id = $1 and client_id = $11 RETURNING *`;

            const updateAlert = await client.query(updateSql, [id, alert_type, alert_name, metric, condition, value, frequency, destination_platform, new Date(), curruentUser.id, curruentUser.client_id]);
            if (updateAlert.rows[0]) {
                return { success: true, msg: "Alert updated successfully." };
            } else {
                return { success: false, msg: "Alert not updated." };
            }
        } else {
            return { success: false, msg: "Alert not updated." };
        }
    }
}

export async function deleteAlertFromDb(id) {
    const curruentUser = await auth();
  
    if (!curruentUser) {
      return { success: false, msg: "You are not authorised to delete alert." };
    }
  
    const sql = `DELETE FROM ecom_embed_test.alert_configurations where id = $1 RETURNING *`;
  
    try {
      const result = await client.query(sql, [id]);
  
      if (result.rows[0]) {
        return { success: true, msg: "Alert deleted sucessfully." };
      }
    } catch (error) {}
    return { success: false, msg: "Alert not deleted." };
  }