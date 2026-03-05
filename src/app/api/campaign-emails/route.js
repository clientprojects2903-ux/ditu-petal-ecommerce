// src/app/api/campaign-emails/route.js
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

export async function POST(request) {
  try {
    // Try to parse as JSON first
    let campaignData;
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      campaignData = await request.json();
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      // Handle form data
      const formData = await request.formData();
      campaignData = Object.fromEntries(formData);
    } else {
      // Try to parse as text and then JSON
      const text = await request.text();
      try {
        campaignData = JSON.parse(text);
      } catch {
        // If it's form-urlencoded string, parse it
        if (text.includes('=')) {
          const params = new URLSearchParams(text);
          campaignData = Object.fromEntries(params);
        } else {
          throw new Error('Unable to parse request data');
        }
      }
    }

    // Log received data for debugging
    console.log('Received campaign data:', campaignData);

    const { 
      request_id, 
      campaign_id, 
      campaign_name, 
      brand_id,
      campaign_description,
      campaign_budget,
      campaign_content_type,
      campaign_timeline_start,
      campaign_timeline_end,
      minimum_followers,
      campaign_niche,
      selection_type
    } = campaignData;

    console.log(`📧 Processing campaign notification for: ${campaign_name}`);

    // Get all influencers
    const { data: influencers, error: userError } = await supabase
      .from('users')
      .select('email, full_name, id')
      .eq('role', 'influencer');

    if (userError) {
      console.error('Error fetching influencers:', userError);
      throw new Error(`Failed to fetch influencers: ${userError.message}`);
    }

    if (!influencers || influencers.length === 0) {
      console.log('No influencers found to notify');
      
      await supabase
        .from('email_notification_logs')
        .update({ 
          recipients_count: 0,
          processed_at: new Date().toISOString(),
          status: 'success'
        })
        .eq('id', request_id);

      return NextResponse.json({ 
        message: 'No influencers to notify',
        campaign_id 
      });
    }

    console.log(`Found ${influencers.length} influencers to notify`);

    // Send emails
    const emailPromises = influencers.map(influencer => 
      sendCampaignEmail(influencer, campaignData)
    );

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    // Update notification log
    const { error: updateError } = await supabase
      .from('email_notification_logs')
      .update({ 
        recipients_count: influencers.length,
        processed_at: new Date().toISOString(),
        status: failed === 0 ? 'success' : 'partial',
        response: JSON.stringify({
          successful,
          failed,
          total: influencers.length
        })
      })
      .eq('id', request_id);

    if (updateError) {
      console.error('Error updating notification log:', updateError);
    }

    console.log(`✅ Emails sent: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      campaign_id,
      campaign_name,
      total_influencers: influencers.length,
      emails_sent: successful,
      emails_failed: failed
    });

  } catch (error) {
    console.error('❌ Error in campaign email endpoint:', error);
    
    // Try to update log if we have request_id
    try {
      const text = await request.text();
      const match = text.match(/request_id=(\d+)/);
      if (match) {
        await supabase
          .from('email_notification_logs')
          .update({ 
            status: 'failed',
            error_message: error.message,
            processed_at: new Date().toISOString()
          })
          .eq('id', match[1]);
      }
    } catch {
      // Ignore if can't update log
    }
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function sendCampaignEmail(influencer, campaign) {
  const {
    campaign_name,
    campaign_description,
    campaign_budget,
    campaign_content_type,
    campaign_timeline_start,
    campaign_timeline_end,
    minimum_followers,
    campaign_niche,
    campaign_id,
    selection_type
  } = campaign;

  // Parse content type if it's a string
  let contentTypes = 'Various';
  if (campaign_content_type) {
    try {
      const parsed = typeof campaign_content_type === 'string' 
        ? JSON.parse(campaign_content_type) 
        : campaign_content_type;
      contentTypes = Array.isArray(parsed) 
        ? parsed.join(', ') 
        : Object.keys(parsed).join(', ');
    } catch {
      contentTypes = campaign_content_type;
    }
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #1a1a1a; 
          margin: 0; 
          padding: 0; 
          background-color: #f4f4f7;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: #ffffff; 
          border-radius: 16px; 
          overflow: hidden; 
          box-shadow: 0 8px 20px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 32px; 
          font-weight: 700; 
        }
        .content { 
          padding: 40px 30px; 
          background: #ffffff; 
        }
        .campaign-card { 
          background: #f8fafc; 
          border-radius: 12px; 
          padding: 25px; 
          margin: 25px 0; 
          border-left: 4px solid #2563eb; 
        }
        .button { 
          display: inline-block; 
          padding: 16px 32px; 
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); 
          color: white !important; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          margin: 20px 0; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 New Campaign at flexfund.in!</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${influencer.full_name || 'Influencer'},</h2>
          
          <div class="campaign-card">
            <h2 style="margin-top: 0;">${campaign_name}</h2>
            
            ${campaign_description ? `
            <p><strong>Description:</strong> ${campaign_description}</p>
            ` : ''}
            
            ${campaign_budget ? `
            <p><strong>Budget:</strong> ₹${Number(campaign_budget).toLocaleString()}</p>
            ` : ''}
            
            <p><strong>Content Type:</strong> ${contentTypes}</p>
            
            ${campaign_niche ? `<p><strong>Niche:</strong> ${campaign_niche}</p>` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="https://www.flexfund.in/campaign/${campaign_id}" class="button">
              View Campaign Details
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"flexfund.in" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: influencer.email,
    subject: `🎯 New Campaign: ${campaign_name}`,
    html: emailHtml
  };

  return transporter.sendMail(mailOptions);
}