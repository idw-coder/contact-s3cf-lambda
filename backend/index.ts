export const handler = async (event: any) => {
  console.log("event:", JSON.stringify(event));
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "hello from TypeScript" }),
  };
};