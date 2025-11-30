import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// Stock behavior profiles
const stockProfiles = {
  'דביר ברקת': { type: 'strong', volatility: 0.09, trend: 0.04, cycles: 4 },
  'יוסף קחלר': { type: 'strong', volatility: 0.08, trend: 0.035, cycles: 4 },
  'איתי אוחנה': { type: 'strong', volatility: 0.075, trend: 0.03, cycles: 4 },
  'עמית לסרי': { type: 'strong', volatility: 0.07, trend: 0.032, cycles: 4 },
  'דביר אוחנה': { type: 'strong', volatility: 0.07, trend: 0.03, cycles: 4 },
  'אריאל שרביט': { type: 'weak', volatility: 0.15, trend: -0.02, cycles: 3 },
  'אריאל עין גל': { type: 'weak', volatility: 0.14, trend: -0.018, cycles: 3 },
  'חיים מרקס': { type: 'weak', volatility: 0.16, trend: -0.022, cycles: 3 },
  'יוגב שבתאי': { type: 'weak', volatility: 0.13, trend: -0.019, cycles: 3 },
  'קורן נאגר': { type: 'weak', volatility: 0.12, trend: -0.017, cycles: 3 },
  'ליאב בן יעקב': { type: 'weak', volatility: 0.17, trend: -0.025, cycles: 3 },
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get current stock prices
    const { data: stocks, error: fetchError } = await supabase
      .from('stock_prices')
      .select('*');

    if (fetchError) throw fetchError;

    const updates = [];

    for (const stock of stocks) {
      const profile = stockProfiles[stock.member_name] || { type: 'medium', volatility: 0.05, trend: 0.01, cycles: 4 };
      
      // Calculate price change
      let changePercent = 0;
      
      if (profile.type === 'strong') {
        // Strong stocks: mostly up with occasional drops
        const cycle = Math.floor(Date.now() / 300000) % (profile.cycles + 1); // 5 min cycles
        if (cycle < profile.cycles) {
          // Going up
          changePercent = (Math.random() * profile.volatility * 0.8) + (profile.volatility * 0.2);
        } else {
          // Drop
          changePercent = -(Math.random() * profile.volatility * 0.9);
        }
      } else if (profile.type === 'weak') {
        // Weak stocks: volatile, mostly down
        const rand = Math.random();
        if (rand < 0.3) {
          // Occasional rise
          changePercent = Math.random() * profile.volatility * 0.5;
        } else {
          // Mostly drops
          changePercent = -(Math.random() * profile.volatility);
        }
      } else {
        // Medium stocks: balanced
        changePercent = (Math.random() - 0.5) * profile.volatility;
      }

      // Add some trend
      changePercent += profile.trend / 100;

      const newPrice = stock.current_price * (1 + changePercent);
      const dailyChange = ((newPrice - stock.current_price) / stock.current_price) * 100;

      updates.push({
        member_name: stock.member_name,
        current_price: newPrice,
        daily_change_percent: stock.daily_change_percent + dailyChange,
        last_updated: new Date().toISOString(),
      });

      // Save to history
      await supabase.from('stock_price_history').insert([{
        member_name: stock.member_name,
        price: newPrice,
        timestamp: new Date().toISOString(),
      }]);
    }

    // Update all stock prices
    for (const update of updates) {
      await supabase
        .from('stock_prices')
        .update(update)
        .eq('member_name', update.member_name);
    }

    return new Response(
      JSON.stringify({ success: true, updated: updates.length }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});