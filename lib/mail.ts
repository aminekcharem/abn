import net from "node:net";
import tls from "node:tls";

type MailOptions = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

type MailResult = {
  skipped: boolean;
};

function encodeHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function escapeSmtpLine(value: string) {
  return value
    .replace(/\r?\n/g, "\r\n")
    .split("\r\n")
    .map((line) => (line.startsWith(".") ? `.${line}` : line))
    .join("\r\n");
}

function readResponse(socket: net.Socket | tls.TLSSocket) {
  return new Promise<string>((resolve, reject) => {
    let buffer = "";

    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const lastLine = lines.at(-1);

      if (lastLine && /^\d{3} /.test(lastLine)) {
        socket.off("data", onData);
        socket.off("error", onError);
        resolve(buffer);
      }
    };

    const onError = (error: Error) => {
      socket.off("data", onData);
      reject(error);
    };

    socket.on("data", onData);
    socket.once("error", onError);
  });
}

async function command(socket: net.Socket | tls.TLSSocket, value: string) {
  socket.write(`${value}\r\n`);
  const response = await readResponse(socket);

  if (!/^[23]\d{2}/.test(response)) {
    throw new Error(`SMTP command failed: ${response.trim()}`);
  }

  return response;
}

function connectSmtp() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host) {
    return null;
  }

  return new Promise<net.Socket | tls.TLSSocket>((resolve, reject) => {
    if (secure) {
      const socket = tls.connect({ host, port, servername: host });

      socket.once("secureConnect", () => resolve(socket));
      socket.once("error", reject);
      return;
    }

    const socket = net.connect({ host, port });

    socket.once("connect", () => resolve(socket));
    socket.once("error", reject);
  });
}

function upgradeToTls(socket: net.Socket, host: string) {
  return new Promise<tls.TLSSocket>((resolve, reject) => {
    const secureSocket = tls.connect({ servername: host, socket });

    secureSocket.once("secureConnect", () => resolve(secureSocket));
    secureSocket.once("error", reject);
  });
}

export async function sendMail(options: MailOptions): Promise<MailResult> {
  let socket = await connectSmtp();

  if (!socket) {
    return { skipped: true };
  }

  const host = process.env.SMTP_HOST || "localhost";
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const port = Number(process.env.SMTP_PORT || 587);
  const isImplicitTls = process.env.SMTP_SECURE === "true" || port === 465;

  if (!from) {
    socket.end();
    return { skipped: true };
  }

  await readResponse(socket);
  const ehloResponse = await command(socket, `EHLO ${host}`);

  if (!isImplicitTls && ehloResponse.includes("STARTTLS")) {
    await command(socket, "STARTTLS");
    socket = await upgradeToTls(socket as net.Socket, host);
    await command(socket, `EHLO ${host}`);
  }

  if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    await command(socket, "AUTH LOGIN");
    await command(
      socket,
      Buffer.from(process.env.SMTP_USER, "utf8").toString("base64"),
    );
    await command(
      socket,
      Buffer.from(process.env.SMTP_PASSWORD, "utf8").toString("base64"),
    );
  }

  const boundary = `autopro-${Date.now()}`;
  const message = [
    `From: ${encodeHeader(from)}`,
    `To: ${encodeHeader(options.to)}`,
    `Subject: ${encodeHeader(options.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    options.text,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=utf-8",
    "",
    options.html,
    "",
    `--${boundary}--`,
  ].join("\r\n");

  await command(socket, `MAIL FROM:<${from}>`);
  await command(socket, `RCPT TO:<${options.to}>`);
  await command(socket, "DATA");
  socket.write(`${escapeSmtpLine(message)}\r\n.\r\n`);
  const dataResponse = await readResponse(socket);

  if (!/^2\d{2}/.test(dataResponse)) {
    throw new Error(`SMTP data failed: ${dataResponse.trim()}`);
  }

  await command(socket, "QUIT");
  socket.end();

  return { skipped: false };
}
