import { sendMail } from "@/lib/mail";

export async function sendPasswordResetEmail({
  email,
  name,
  resetUrl,
  subject = "Reinitialisation de votre mot de passe AutoPro",
}: {
  email: string;
  name: string;
  resetUrl: string;
  subject?: string;
}) {
  return sendMail({
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h1 style="font-size:20px">Bonjour ${name},</h1>
        <p>Un acces administrateur AutoPro est pret pour cette adresse e-mail.</p>
        <p>Utilisez le lien ci-dessous pour definir ou reinitialiser votre mot de passe.</p>
        <p><a href="${resetUrl}" style="display:inline-block;background:#a21d2f;color:#050b20;padding:12px 18px;border-radius:6px;font-weight:700;text-decoration:none">Definir mon mot de passe</a></p>
        <p>Ce lien expire dans 60 minutes.</p>
        <p style="font-size:12px;color:#6b7280">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur:<br>${resetUrl}</p>
      </div>
    `,
    subject,
    text: [
      `Bonjour ${name},`,
      "",
      "Un acces administrateur AutoPro est pret pour cette adresse e-mail.",
      "Utilisez le lien suivant pour definir ou reinitialiser votre mot de passe:",
      resetUrl,
      "",
      "Ce lien expire dans 60 minutes.",
    ].join("\n"),
    to: email,
  });
}
