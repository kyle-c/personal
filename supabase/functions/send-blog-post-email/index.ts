import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { Resend } from 'https://esm.sh/@resend/server'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const resend = new Resend('re_CDtz7PQZ_NtvSquFNDskp5KdL2AtDPSei')

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { post } = await req.json()

    // Get all verified subscribers who haven't unsubscribed
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('email, verification_token')
      .eq('verified', true)
      .is('unsubscribed_at', null)

    if (subscribersError) throw subscribersError

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No subscribers to notify' }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      )
    }

    // Get site styles
    const { data: styles } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'email_styles')
      .single()

    const emailStyles = styles?.value || `
      body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      h1 { font-size: 24px; margin-bottom: 16px; }
      p { margin-bottom: 16px; }
      .button { display: inline-block; padding: 12px 24px; background-color: #333; color: white; text-decoration: none; border-radius: 6px; }
      .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
    `

    // Send email to each subscriber
    const siteUrl = `${req.headers.get('origin')}`
    const emailPromises = subscribers.map(subscriber => {
      const unsubscribeLink = `${siteUrl}/unsubscribe?token=${subscriber.verification_token}`
      
      return resend.emails.send({
        from: 'Kyle Cooney <kyle@unbndl.com>',
        to: subscriber.email,
        subject: `New blog post: ${post.title}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>${emailStyles}</style>
            </head>
            <body>
              <div class="container">
                <h1>${post.title}</h1>
                ${post.content.split('\n\n').map(p => `<p>${p}</p>`).join('')}
                <p>
                  <a href="${siteUrl}/blog/${post.slug}" class="button">
                    Read on website
                  </a>
                </p>
                <div class="footer">
                  <p>
                    You're receiving this because you subscribed to blog updates. 
                    <a href="${unsubscribeLink}">Unsubscribe</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `
      })
    })

    await Promise.all(emailPromises)

    return new Response(
      JSON.stringify({ message: 'Blog post emails sent' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    )
  }
})