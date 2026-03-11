import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params first
    const { id } = await params;
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params first
    const { id } = await params;
    const body = await request.json();
    
    // Only update the fields that are provided
    // Remove fields that shouldn't be updated
    const { id: _, created_at, categories, ...updateData } = body;
    
    // Clean the data - convert empty strings to null
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    );

    console.log('Patching product with ID:', id);
    console.log('Patch data:', cleanedData);

    const { data, error } = await supabase
      .from('products')
      .update({ ...cleanedData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params first
    const { id } = await params;
    const body = await request.json();
    
    // Remove fields that shouldn't be updated
    const { id: _, created_at, categories, ...updateData } = body;
    
    // Clean the data - convert empty strings to null
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    );

    console.log('Updating product with ID:', id);
    console.log('Update data:', cleanedData);

    const { data, error } = await supabase
      .from('products')
      .update({ ...cleanedData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params first
    const { id } = await params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}