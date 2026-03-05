import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Correct type for App Router
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params since they're now a Promise
    const { id } = await context.params
    
    const supabase = await createClient()
    
    // Get current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Update application status to approved
    const { error: updateError } = await supabase
      .from('applications')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('application_id', id) // Use the destructured id
    
    if (updateError) {
      console.error('Error updating application:', updateError)
      return NextResponse.json({ error: 'Failed to approve application' }, { status: 500 })
    }
    
    // Fetch the updated application with campaign info
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select(`
        *,
        campaigns (
          campaign_id,
          campaign_name,
          influencer_id
        )
      `)
      .eq('application_id', id) // Use the destructured id
      .single()
    
    if (fetchError) {
      console.error('Error fetching updated application:', fetchError)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Application approved successfully',
      data: application
    })
    
  } catch (error) {
    console.error('Error in approve application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}