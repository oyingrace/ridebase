import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon('postgresql://uber-db_owner:5pyR6jhHCoqS@ep-fragrant-hall-a5vfluze.us-east-2.aws.neon.tech/uber-db?sslmode=require');
    const { name, email, clerkId } = await request.json();

    if (!name || !email || !clerkId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const response = await sql`
      INSERT INTO users (
        name, 
        email, 
        clerk_id
      ) 
      VALUES (
        ${name}, 
        ${email},
        ${clerkId}
     );`;

    return new Response(JSON.stringify({ data: response }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 

