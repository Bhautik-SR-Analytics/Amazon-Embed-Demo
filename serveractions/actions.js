"use server";

import { auth } from "@/utils/auth";
import client from "@/utils/db";
import { generateUserId } from "@/utils/lib";
import { saltAndHashPassword } from "@/utils/password";

export async function getUsers() {
  const sql = `SELECT * FROM ecom_embed_test.users`;
  try {
    const result = await client.query(sql);

    return result.rowCount === 0 ? null : result.rows;
  } catch (e) {
    return null;
  }
}

export async function createUser(data, client_name) {
  const curruentUser = await auth();

  if (!curruentUser) {
    return { success: false, msg: "You are not authorised to create user." };
  }
  const { username, password, client_id, user_role, report_list } = data;

  const checkUser = await getUserFromDb(username);

  if (checkUser) {
    return { success: false, msg: `${username} already existed.` };
  }

  try {
    // const reportTOstring = report_list.join(",");
    const pwHash = await saltAndHashPassword(password);
    const userId = await generateUserId(username, client_id, client_name, user_role);
    const sql = `
        INSERT INTO ecom_embed_test.users (user_id, username, password, client_id, client_name, user_role, report_list, created_by, last_modified_by) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING user_id`;
    const result = await client.query(sql, [userId, username, pwHash, client_id, client_name, user_role, report_list, curruentUser.id, curruentUser.id]);
    if (result.rows[0]) {
      return { success: true, msg: "User added successfully." };
    } else {
      return { success: false, msg: "User not added." };
    }
  } catch (error) {
    console.log(error);
  }
  return { success: false, msg: "User not added." };
}

export async function updateUser(data, client_name, userId) {
  const curruentUser = await auth();

  if (!curruentUser || curruentUser?.userRole !== "ADMIN") {
    return { success: false, msg: "You are not authorised to update user." };
  }

  let newUser = data;
  const { username, password, client_id, user_role, report_list } = newUser;

  if (userId) {
    const existingDataSql = `SELECT username, password, client_name, client_id, user_role, report_list FROM ecom_embed_test.users where user_id = $1`;
    const getUser = await client.query(existingDataSql, [userId]);

    if (getUser.rows[0]) {
      newUser = {
        ...getUser.rows[0],
        ...data,
      };

      let pwHash = getUser.rows[0].password;

      if (newUser.password !== "") {
        pwHash = await saltAndHashPassword(password);
      }

      const updateSql = `UPDATE ecom_embed_test.users set username = $2, password = $3, client_id = $4, client_name = $5, user_role = $6, report_list = $7, last_modified_by = $8
  where user_id = $1 RETURNING user_id`;

      const updateUser = await client.query(updateSql, [userId, username, pwHash, client_id, client_name, user_role, report_list, curruentUser.id]);
      if (updateUser.rows[0]) {
        return { success: true, msg: "User updated successfully." };
      } else {
        return { success: false, msg: "User not updated." };
      }
    } else {
      return { success: false, msg: "User not updated." };
    }
  }
}

export async function deleteUser(id) {
  const curruentUser = await auth();

  if (!curruentUser || curruentUser?.userRole !== "ADMIN") {
    return { success: false, msg: "You are not authorised to update user." };
  }

  const sql = `DELETE FROM ecom_embed_test.users where user_id = $1 RETURNING *`;

  try {
    const result = await client.query(sql, [id]);

    if (result.rows[0]) {
      return { success: true, msg: "User deleted sucessfully." };
    }
  } catch (error) {}
  return { success: false, msg: "User not deleted." };
}

export async function getUserDataByUserID(id) {
  const sql = `SELECT * FROM ecom_embed_test.users where user_id = $1`;
  try {
    const result = await client.query(sql, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error(error?.message ? error.message : "Invalid user id");
  }
}

export async function getUserFromDb(username) {
  const sql = `SELECT user_id, username, user_role, password, client_id FROM ecom_embed_test.users where username = $1`;
  try {
    const result = await client.query(sql, [username]);
    return result.rows[0] ? result.rows[0] : null;
  } catch (error) {
    return null;
  }
}

export async function getUsersReports() {
  const curruentUser = await auth();

  if (!curruentUser) {
    return { success: false, msg: "You are not authorised to create user." };
  }

  const sql = `SELECT m.*
  FROM ecom_embed_test.master_reports m
  JOIN ecom_embed_test.users u ON m.report_id = ANY(string_to_array(u.report_list, ',')::int[])
  WHERE u.user_id = $1;`;

  try {
    const result = await client.query(sql, [curruentUser.id]);
    return result.rows ? result.rows : null;
  } catch (error) {
    return null;
  }
}
