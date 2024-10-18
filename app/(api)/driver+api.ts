import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const sql = neon('postgresql://uber-db_owner:5pyR6jhHCoqS@ep-fragrant-hall-a5vfluze.us-east-2.aws.neon.tech/uber-db?sslmode=require');
    const response = await sql`SELECT * FROM drivers`;

    return Response.json({ data: response });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
