import { getPostHogClient } from "@/lib/posthog-server";

// Using explicit environment bindings injected directly into standard headers
const DOCUMENSO_BASE_URL = process.env.DOCUMENSO_BASE_URL || "https://app.documenso.com/api/v2";
const DOCUMENSO_API_KEY = process.env.DOCUMENSO_API_KEY;

export interface DocumensoCreationResponse {
  documentId: string;
  status?: string;
}

export async function createDocumentFromPdf(
  title: string,
  externalId: string,
  pdfBase64: string,
  clientName: string,
  clientEmail: string
): Promise<DocumensoCreationResponse> {
  if (!DOCUMENSO_API_KEY) {
    throw new Error("Documenso API Key is not configured in the environment.");
  }

  // Construct standard payload for creating a document from Base64 PDF using Documenso V2
  const payload = {
    title,
    externalId, // Crucial for mapping webhooks back to the Supabase saved_estimates ID
    documentData: {
      type: "pdf",
      data: pdfBase64,
    },
    meta: {
      subject: `Signature Request: ${title}`,
      message: "Please review and securely sign the attached estimate via Documenso.",
    },
    recipients: [
      {
        email: clientEmail,
        name: clientName,
        role: "SIGNER",
      },
    ],
  };

  const response = await fetch(`${DOCUMENSO_BASE_URL}/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DOCUMENSO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Documenso API Draft Creation Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  return {
    documentId: data.id,
    status: data.status,
  };
}

export async function sendDocumensoDocument(documentId: string) {
  if (!DOCUMENSO_API_KEY) {
    throw new Error("Documenso API Key is not configured.");
  }

  const response = await fetch(`${DOCUMENSO_BASE_URL}/documents/${documentId}/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DOCUMENSO_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Documenso API Send Error (${response.status}): ${errorText}`);
  }

  return response.json();
}
