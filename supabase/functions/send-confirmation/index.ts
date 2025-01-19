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
    const { email } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    // Get the site URL from the request origin
    const siteUrl = req.headers.get('origin') || 'http://localhost:5173'

    // Check if subscriber exists and is already verified
    const { data: existingSubscriber } = await supabase
      .from('subscribers')
      .select('verified, unsubscribed_at')
      .eq('email', email)
      .maybeSingle()

    if (existingSubscriber?.verified && !existingSubscriber?.unsubscribed_at) {
      return new Response(
        JSON.stringify({ message: 'Already subscribed and verified' }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      )
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID()
    const now = new Date().toISOString()

    // Create or update subscriber with verification token
    const { error: upsertError } = await supabase
      .from('subscribers')
      .upsert({
        email,
        verification_token: verificationToken,
        verified: false,
        unsubscribed_at: null,
        verification_sent_at: now
      }, {
        onConflict: 'email'
      })

    if (upsertError) {
      console.error('Database error:', upsertError)
      throw new Error('Failed to save subscription')
    }

    // Create confirmation link
    const confirmationLink = `${siteUrl}/confirm-subscription?token=${verificationToken}`

    // Send email using Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Kyle Cooney <kyle@unbndl.com>',
      to: email,
      subject: 'Confirm your subscription',
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Confirm your subscription</h1>
          <p style="margin-bottom: 16px;">Thanks for subscribing to my blog! Please click the button below to confirm your subscription.</p>
          <a href="${confirmationLink}" style="display: inline-block; padding: 12px 24px; background-color: #333; color: white; text-decoration: none; border-radius: 6px;">
            Confirm subscription
          </a>
          <p style="margin-top: 32px; font-size: 14px; color: #666;">
            If you didn't request this subscription, you can safely ignore this email.
          </p>
        </div>
      `
    })

    if (emailError) {
      console.error('Email error:', emailError)
      throw new Error('Failed to send confirmation email')
    }

    return new Response(
      JSON.stringify({ message: 'Confirmation email sent' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-confirmation:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
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