import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";
import { isUserAdmin } from "@/utils/admin";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify the user is an admin
    const isAdmin = await isUserAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    const url = new URL(req.url);
    const manhwaId = url.searchParams.get("manhwaId");
    const chapterId = url.searchParams.get("chapterId");

    if (chapterId) {
      // Get a specific chapter
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("id", chapterId)
        .single();

      if (error) {
        return NextResponse.json(
          { error: `Error fetching chapter: ${error.message}` },
          { status: 500 },
        );
      }

      return NextResponse.json({ chapter: data });
    } else if (manhwaId) {
      // Get all chapters for a specific manhwa
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("manhwa_id", manhwaId)
        .order("number", { ascending: true });

      if (error) {
        return NextResponse.json(
          { error: `Error fetching chapters: ${error.message}` },
          { status: 500 },
        );
      }

      return NextResponse.json({ chapters: data || [] });
    } else {
      // Get all chapters with manhwa details
      const { data, error } = await supabase
        .from("chapters")
        .select("*, manhwa:manhwa_id(id, title)")
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: `Error fetching chapters: ${error.message}` },
          { status: 500 },
        );
      }

      return NextResponse.json({ chapters: data || [] });
    }
  } catch (error: any) {
    console.error("Error in admin chapters route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chapters" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const chapterData = await req.json();

    if (!chapterData.manhwa_id || !chapterData.number) {
      return NextResponse.json(
        { error: "Manhwa ID and chapter number are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify the user is an admin
    const isAdmin = await isUserAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    // Check if chapter already exists
    const { data: existingChapter } = await supabase
      .from("chapters")
      .select("id")
      .eq("manhwa_id", chapterData.manhwa_id)
      .eq("number", chapterData.number)
      .maybeSingle();

    if (existingChapter) {
      return NextResponse.json(
        { error: "A chapter with this number already exists for this manhwa" },
        { status: 400 },
      );
    }

    // Create the chapter
    const { data, error } = await supabase
      .from("chapters")
      .insert({
        manhwa_id: chapterData.manhwa_id,
        number: chapterData.number,
        title: chapterData.title || `Chapter ${chapterData.number}`,
        coin_price: chapterData.coin_price || 10,
        is_free: chapterData.is_free || false,
        is_premium: chapterData.is_premium || false,
        pages: chapterData.pages || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: chapterData.published_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Error creating chapter: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      chapter: data,
      message: "Chapter created successfully",
    });
  } catch (error: any) {
    console.error("Error creating chapter:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create chapter" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Chapter ID is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify the user is an admin
    const isAdmin = await isUserAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    // Update the chapter
    const { data, error } = await supabase
      .from("chapters")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Error updating chapter: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      chapter: data,
      message: "Chapter updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating chapter:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update chapter" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Chapter ID is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify the user is an admin
    const isAdmin = await isUserAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    // Delete the chapter
    const { error } = await supabase.from("chapters").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: `Error deleting chapter: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Chapter deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting chapter:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete chapter" },
      { status: 500 },
    );
  }
}
