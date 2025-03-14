import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";
import { isUserAdmin } from "@/utils/admin";

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
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

    // Parse query parameters
    const url = new URL(req.url);
    const manhwaId = url.searchParams.get("id");

    if (manhwaId) {
      // Get a specific manhwa with its chapters
      const { data: manhwa, error: manhwaError } = await supabase
        .from("manhwa")
        .select("*")
        .eq("id", manhwaId)
        .single();

      if (manhwaError) {
        return NextResponse.json(
          { error: `Error fetching manhwa: ${manhwaError.message}` },
          { status: 500 },
        );
      }

      // Get chapters for this manhwa
      const { data: chapters, error: chaptersError } = await supabase
        .from("chapters")
        .select("*")
        .eq("manhwa_id", manhwaId)
        .order("number", { ascending: true });

      if (chaptersError) {
        console.error("Error fetching chapters:", chaptersError);
      }

      return NextResponse.json({
        manhwa,
        chapters: chapters || [],
      });
    } else {
      // Get all manhwa with chapter counts
      const { data: manhwaList, error: manhwaError } = await supabase
        .from("manhwa")
        .select("*")
        .order("title", { ascending: true });

      if (manhwaError) {
        return NextResponse.json(
          { error: `Error fetching manhwa list: ${manhwaError.message}` },
          { status: 500 },
        );
      }

      // Get chapter counts for each manhwa
      const manhwaWithCounts = await Promise.all(
        (manhwaList || []).map(async (manhwa) => {
          const { count, error: countError } = await supabase
            .from("chapters")
            .select("*", { count: "exact", head: true })
            .eq("manhwa_id", manhwa.id);

          return {
            ...manhwa,
            chapterCount: count || 0,
          };
        }),
      );

      return NextResponse.json({ manhwaList: manhwaWithCounts });
    }
  } catch (error: any) {
    console.error("Error in admin manhwa route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const manhwaData = await req.json();

    if (!manhwaData.title || !manhwaData.slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 },
      );
    }

    // Get the authenticated user
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

    // Check if slug already exists
    const { data: existingManhwa } = await supabase
      .from("manhwa")
      .select("id")
      .eq("slug", manhwaData.slug)
      .maybeSingle();

    if (existingManhwa) {
      return NextResponse.json(
        { error: "A manhwa with this slug already exists" },
        { status: 400 },
      );
    }

    // Create the manhwa
    const { data, error } = await supabase
      .from("manhwa")
      .insert({
        title: manhwaData.title,
        slug: manhwaData.slug,
        description: manhwaData.description || null,
        cover_image: manhwaData.cover_image || null,
        banner_image: manhwaData.banner_image || null,
        author: manhwaData.author || null,
        artist: manhwaData.artist || null,
        status: manhwaData.status || "Ongoing",
        rating: manhwaData.rating || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Error creating manhwa: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      manhwa: data,
      message: "Manhwa created successfully",
    });
  } catch (error: any) {
    console.error("Error creating manhwa:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create manhwa" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Manhwa ID is required" },
        { status: 400 },
      );
    }

    // Get the authenticated user
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

    // If slug is being updated, check if it already exists for another manhwa
    if (updateData.slug) {
      const { data: existingManhwa } = await supabase
        .from("manhwa")
        .select("id")
        .eq("slug", updateData.slug)
        .neq("id", id)
        .maybeSingle();

      if (existingManhwa) {
        return NextResponse.json(
          { error: "Another manhwa with this slug already exists" },
          { status: 400 },
        );
      }
    }

    // Update the manhwa
    const { data, error } = await supabase
      .from("manhwa")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Error updating manhwa: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      manhwa: data,
      message: "Manhwa updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating manhwa:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update manhwa" },
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
        { error: "Manhwa ID is required" },
        { status: 400 },
      );
    }

    // Get the authenticated user
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

    // First, delete all chapters associated with this manhwa
    const { error: chaptersError } = await supabase
      .from("chapters")
      .delete()
      .eq("manhwa_id", id);

    if (chaptersError) {
      return NextResponse.json(
        { error: `Error deleting chapters: ${chaptersError.message}` },
        { status: 500 },
      );
    }

    // Then delete the manhwa itself
    const { error } = await supabase.from("manhwa").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: `Error deleting manhwa: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Manhwa and its chapters deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting manhwa:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete manhwa" },
      { status: 500 },
    );
  }
}
