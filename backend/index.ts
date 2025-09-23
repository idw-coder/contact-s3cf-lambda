// AWS SDK関連をコメントアウト（問題解決後に戻す）
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// const s3Client = new S3Client({});
// const BUCKET_NAME = process.env.BUCKET_NAME || "your-bucket-name";

export const handler = async (event: any) => {
  console.log("event:", JSON.stringify(event));
  
  try {
    const { httpMethod, path } = event.requestContext.http;
    
    // 既存のhelloエンドポイント
    if (httpMethod === "GET" && path === "/hello") {
      console.log("Returning hello response");
      return {
        statusCode: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ message: "hello from TypeScript" }),
      };
    }
    
    // 新しい画像アップロード用エンドポイント（一時的にコメントアウト）
    /*
    if (httpMethod === "POST" && path === "/upload") {
      try {
        const body = JSON.parse(event.body || "{}");
        const { fileName, fileType } = body;
        
        if (!fileName || !fileType) {
          return {
            statusCode: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ error: "fileName and fileType are required" })
          };
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const key = `uploads/${timestamp}-${fileName}`;
        
        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          ContentType: fileType,
        });
        
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
        
        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify({
            uploadUrl: signedUrl,
            key: key
          })
        };
        
      } catch (error) {
        console.error("Upload error:", error);
        return {
          statusCode: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify({ error: "Failed to generate upload URL" })
        };
      }
    }
    */
    
    console.log("Returning 404");
    return {
      statusCode: 404,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ error: "Not Found" })
    };
    
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};