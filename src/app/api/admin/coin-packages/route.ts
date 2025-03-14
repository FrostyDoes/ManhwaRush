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
    const packageId = url.searchParams.get("id");

    if (packageId) {
      // Get a specific package
      const { data, error } = await supabase
        .from("coin_packages")
        .select("*")
        .eq("id", packageId)
        .single();

      if (error) {
        return NextResponse.json(
          { error: `Error fetching package: ${error.message}` },
          { status: 500 },
        );
      }

      return NextResponse.json({ package: data });
    } else {
      // Get all packages
      const { data, error } = await supabase
        .from("coin_packages")
        .select("*")
        .order("coins", { ascending: true });

      if (error) {
        return NextResponse.json(
          { error: `Error fetching packages: ${error.message}` },
          { status: 500 },
        );
      }

      return NextResponse.json({ packages: data || [] });
    }
  } catch (error: any) {
    console.error("Error in admin coin packages route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch coin packages" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const packageData = await req.json();

    if (
      !packageData.name ||
      !packageData.coins ||
      !packageData.price ||
      !packageData.stripe_price_id
    ) {
      return NextResponse.json(
        { error: "Name, coins, price, and Stripe price ID are required" },
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

    // Create the package
    const { data, error } = await supabase
      .from("coin_packages")
      .insert({
        name: packageData.name,
        description: packageData.description || null,
        coins: packageData.coins,
        price: packageData.price,
        stripe_price_id: packageData.stripe_price_id,
        is_active:
          packageData.is_active !== undefined ? packageData.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Error creating package: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      package: data,
      message: "Coin package created successfully",
    });
  } catch (error: any) {
    console.error("Error creating coin package:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create coin package" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const packageId = url.searchParams.get("id");

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 },
      );
    }

    const packageData = await req.json();

    if (
      !packageData.name ||
      !packageData.coins ||
      !packageData.price ||
      !packageData.stripe_price_id
    ) {
      return NextResponse.json(
        { error: "Name, coins, price, and Stripe price ID are required" },
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

    // Update the package
    const { data, error } = await supabase
      .from("coin_packages")
      .update({
        name: packageData.name,
        description: packageData.description || null,
        coins: packageData.coins,
        price: packageData.price,
        stripe_price_id: packageData.stripe_price_id,
        is_active:
          packageData.is_active !== undefined ? packageData.is_active : true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", packageId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Error updating package: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      package: data,
      message: "Coin package updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating coin package:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update coin package" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const packageId = url.searchParams.get("id");

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID is required" },
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

    // Delete the package
    const { error } = await supabase
      .from("coin_packages")
      .delete()
      .eq("id", packageId);

    if (error) {
      return NextResponse.json(
        { error: `Error deleting package: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coin package deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting coin package:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete coin package" },
      { status: 500 },
    );
  }
}
