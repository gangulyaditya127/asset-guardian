import JSZip from "jszip";

interface MailResult {
  owner: string;
  mail_body_html?: string;
}

export async function downloadMailHtml(results: MailResult[]) {
  const withHtml = results.filter((r) => r.mail_body_html);
  if (withHtml.length === 0) return;

  if (withHtml.length === 1) {
    const blob = new Blob([withHtml[0].mail_body_html!], { type: "text/html" });
    downloadBlob(blob, `notification_${withHtml[0].owner}.html`);
  } else {
    const zip = new JSZip();
    withHtml.forEach((r) => {
      zip.file(`notification_${r.owner}.html`, r.mail_body_html!);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, "notifications.zip");
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
