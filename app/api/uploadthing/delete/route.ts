import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utApi = new UTApi();

export async function POST(req: NextRequest) {
  const { userId } = auth();

  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { imageKey } = await req.json();

  try {
    const res = await utApi.deleteFiles(imageKey);

    return NextResponse.json(res);
  } catch (error: any) {
    console.error("error at uploadthing/delete", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
