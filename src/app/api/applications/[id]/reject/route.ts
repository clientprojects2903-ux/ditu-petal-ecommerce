import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Define the type for the second argument
type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    
    // Get current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Update application status to rejected
    const { error: updateError } = await supabase
      .from('applications')
      .update({ 
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('application_id', id)
    
    if (updateError) {
      console.error('Error updating application:', updateError)
      return NextResponse.json({ error: 'Failed to reject application' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Application rejected successfully'
    })
    
  } catch (error) {
    console.error('Error in reject application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}