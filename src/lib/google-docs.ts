import { google } from "googleapis";
import fs from "fs";
import path from "path";

const DOC_ID = process.env.GOOGLE_DOC_ID!;

function getAuth() {
  const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (keyFilePath) {
    const resolvedPath = path.resolve(keyFilePath);
    const credentials = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/documents.readonly"],
    });
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/documents.readonly"],
  });
}

export async function fetchDocContent() {
  const auth = getAuth();
  const docs = google.docs({ version: "v1", auth });
  const response = await docs.documents.get({ documentId: DOC_ID });
  return response.data;
}
