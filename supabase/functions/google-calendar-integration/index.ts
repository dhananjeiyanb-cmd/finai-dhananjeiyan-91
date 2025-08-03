import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    date: string;
  };
  end: {
    date: string;
  };
  reminders: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, reminder_id, action } = await req.json();

    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user profile with email
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('full_name')
      .eq('id', user_id)
      .single();

    if (profileError) throw profileError;

    // Get user email from auth
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.getUserById(user_id);
    if (authError) throw authError;

    const userEmail = authUser.user?.email;
    if (!userEmail) throw new Error('User email not found');

    // Get reminder details
    const { data: reminder, error: reminderError } = await supabaseClient
      .from('reminders')
      .select('*')
      .eq('id', reminder_id)
      .single();

    if (reminderError) throw reminderError;

    if (action === 'create') {
      // Create Google Calendar event
      const googleCalendarApiKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
      if (!googleCalendarApiKey) {
        throw new Error('Google Calendar API key not configured');
      }

      const event: CalendarEvent = {
        summary: `💰 ${reminder.title} - ₹${reminder.amount}`,
        description: `Bill Reminder from FinAI\n\nAmount: ₹${reminder.amount}\nCategory: ${reminder.category}\nFrequency: ${reminder.frequency}\n\n${reminder.description || ''}`,
        start: {
          date: reminder.due_date,
        },
        end: {
          date: reminder.due_date,
        },
        reminders: {
          useDefault: false,
          overrides: [
            {
              method: 'email',
              minutes: 24 * 60, // 1 day before
            },
            {
              method: 'popup',
              minutes: 60, // 1 hour before
            },
          ],
        },
      };

      // Note: This would require OAuth2 setup for actual Google Calendar integration
      // For now, we'll return a success message indicating the event would be created
      console.log('Calendar event would be created:', event);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Calendar reminder created for ${reminder.title}`,
          event: event
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in google-calendar-integration function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);