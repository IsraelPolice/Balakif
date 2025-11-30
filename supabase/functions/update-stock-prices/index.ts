import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// Stock behavior profiles
const stockProfiles = {
  'דביר ברקת': { type: 'strong', volatility: 0.09, trend: 0.04, cycles: 4 },
  'עמית לסרי': { type: 'strong', volatility: 0.08, trend: 0.038, cycles: 4 },
  'יוסף קחלר': { type: 'strong', volatility: 0.075, trend: 0.035, cycles: 4 },
  'איתי אוחנה': { type: 'strong', volatility: 0.07, trend: 0.033, cycles: 4 },
  'דביר אוחנה': { type: 'strong', volatility: 0.072, trend: 0.031, cycles: 4 },
  'אריאל שרביט': { type: 'weak', volatility: 0.17, trend: -0.025, cycles: 3 },
  'אריאל עין גל': { type: 'weak', volatility: 0.15, trend: -0.022, cycles: 3 },
  'קורן נאגר': { type: 'weak', volatility: 0.16, trend: -0.023, cycles: 3 },
  'חיים מרקס': { type: 'weak', volatility: 0.14, trend: -0.020, cycles: 3 },
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

    const { data: stocks, error: fetchError } = await supabase
      .from('stock_prices')
      .select('*');

    if (fetchError) throw fetchError;

    const updates = [];

    for (const stock of stocks) {
      const profile = stockProfiles[stock.member_name] || { type: 'medium', volatility: 0.05, trend: 0.01, cycles: 4 };
      
      let changePercent = 0;
      
      if (profile.type === 'strong') {
        const cycle = Math.floor(Date.now() / 300000) % (profile.cycles + 1);
        if (cycle < profile.cycles) {
          changePercent = (Math.random() * profile.volatility * 0.8) + (profile.volatility * 0.2);
        } else {
          changePercent = -(Math.random() * profile.volatility * 0.9);
        }
      } else if (profile.type === 'weak') {
        const rand = Math.random();
        if (rand < 0.3) {
          changePercent = Math.random() * profile.volatility * 0.5;
        } else {
          changePercent = -(Math.random() * profile.volatility);
        }
      } else {
        changePercent = (Math.random() - 0.5) * profile.volatility;
      }

      changePercent += profile.trend / 100;

      const newPrice = stock.current_price * (1 + changePercent);
      const dailyChange = ((newPrice - stock.current_price) / stock.current_price) * 100;

      updates.push({
        member_name: stock.member_name,
        current_price: newPrice,
        daily_change_percent: stock.daily_change_percent + dailyChange,
        last_updated: new Date().toISOString(),
      });

      await supabase.from('stock_price_history').insert([{
        member_name: stock.member_name,
        price: newPrice,
        timestamp: new Date().toISOString(),
      }]);
    }

    for (const update of updates) {
      await supabase
        .from('stock_prices')
        .update(update)
        .eq('member_name', update.member_name);
    }

    const { data: indices } = await supabase.from('stock_indices').select('*');

    if (indices) {
      for (const index of indices) {
        let totalValue = 0;
        let totalChange = 0;

        for (const memberName of index.member_names) {
          const stock = updates.find(u => u.member_name === memberName);
          if (stock) {
            totalValue += stock.current_price;
            totalChange += stock.daily_change_percent;
          }
        }

        const avgValue = totalValue / index.member_names.length;
        const avgChange = totalChange / index.member_names.length;

        await supabase
          .from('stock_indices')
          .update({
            current_value: avgValue * 100,
            daily_change_percent: avgChange,
            last_updated: new Date().toISOString()
          })
          .eq('id', index.id);
      }
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