/**
 * backend/index.ts  （TypeScript / ESM）
 *
 * 目的：
 *  - API Gateway からのリクエスト（/submit, POST）を受け取り、
 *    JSON { name, email, message } を検証して 200 を返す最小のLambda。
 *  - CORS対応（ブラウザfetchで必要）と、OPTIONSプリフライトへの応答を含む。
 *
 * 実行環境：
 *  - AWS Lambda (Node.js 20.x) / ESM
 *  - ハンドラー指定は "index.handler"（このファイル名が index、export が handler）
 *
 * 後で追加：
 *  - Amazon SESでのメール送信や、Slack通知、DynamoDB保存などは
 *    「// TODO: 〜」の位置に段階的に追加する。
 */

// --- 型定義（外部型パッケージなしで最小限の安全性を確保） -------------------
type HttpMethod = "GET" | "POST" | "OPTIONS" | string;

interface ApiEvent {
  httpMethod?: string; // REST APIのパターン
  requestContext?: {   // HTTP API (v2) のパターン
    http?: { method?: string }
    requestId?: string;
  };
  body?: string | null;
}

interface ApiResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
}

// --- CORSヘッダーを共通化 -----------------------------------------------
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",             // 必要に応じて特定のドメインへ絞る
  "Access-Control-Allow-Headers": "Content-Type", // JSON送信で必要
  "Access-Control-Allow-Methods": "OPTIONS,POST"  // プリフライトと本体POSTに対応
};

// --- JSONレスポンスの小ヘルパー -----------------------------------------
function json(statusCode: number, bodyObj: unknown): ApiResponse {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(bodyObj)
  };
}

// --- 簡単なバリデーション -----------------------------------------------
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- メインハンドラ ------------------------------------------------------
export const handler = async (event: ApiEvent): Promise<ApiResponse> => {
  try {
    console.log('Request:', { requestId: event?.requestContext?.requestId });

    // メソッド判定：REST(API v1) と HTTP API(v2) の両方に配慮
    const method: HttpMethod =
      event?.httpMethod || event?.requestContext?.http?.method || "GET";

    // プリフライト(OPTIONS)は即200
    if (method === "OPTIONS") {
      return json(200, { ok: true });
    }

    // POST 以外は不許可（必要ならGET等を個別に追加）
    if (method !== "POST") {
      return json(405, { error: "Method Not Allowed" });
    }

    // ボディをJSONとしてパース（空なら {}）
    const body: ContactPayload = JSON.parse(event?.body ?? "{}");

    // 必須チェック（最小限）
    const { name, email, message } = body;
    if (!name || !email || !message) {
      return json(400, { error: "name, email, message は必須です" });
    }

    // バリデーション
    if (!isValidEmail(email)) {
      return json(400, { error: "有効なメールアドレスを入力してください" });
    }
    if (name.length > 100 || message.length > 1000) {
      return json(400, { error: "入力内容が長すぎます" });
    }

    // 本処理（ダミー）
    // ここに実処理を追加：
    // - Amazon SESでメール送信
    // - Slack Webhookで通知
    // - DynamoDB / S3 へ保存
    console.log("contact payload:", { name, email, message });

    // TODO: SES送信例（擬似コード）
    // await sesClient.send(new SendEmailCommand({
    //   Destination: { ToAddresses: ["contact@example.com"] },
    //   Message: {
    //     Subject: { Data: `問い合わせ: ${name}` },
    //     Body:    { Text: { Data: `from: ${email}\n\n${message}` } }
    //   },
    //   Source: "no-reply@example.com"
    // }));

    // 正常応答
    return json(200, { ok: true });

  } catch (e) {
    // 想定外エラー
    console.error("unhandled error:", e);
    return json(500, { error: "internal error" });
  }
};