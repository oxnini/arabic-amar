import { google } from "googleapis";

const DOC_ID = process.env.GOOGLE_DOC_ID!;

function getAuth() {
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
