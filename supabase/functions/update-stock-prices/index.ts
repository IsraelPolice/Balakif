import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const stockProfiles = {
  'דביר ברקת': { type: 'strong', volatility: 0.15, trend: 0.02, upChance: 0.65 },
  'עמית לסרי': { type: 'strong', volatility: 0.14, trend: 0.018, upChance: 0.63 },
  'יוסף קחלר': { type: 'strong', volatility: 0.13, trend: 0.015, upChance: 0.62 },
  'איתי אוחנה': { type: 'strong', volatility: 0.12, trend: 0.012, upChance: 0.60 },
  'דביר אוחנה': { type: 'medium', volatility: 0.18, trend: 0, upChance: 0.50 },
  'אריאל שרביט': { type: 'weak', volatility: 0.20, trend: -0.015, upChance: 0.38 },
  'אריאל עין גל': { type: 'weak', volatility: 0.19, trend: -0.012, upChance: 0.40 },
  'קורן נאגר': { type: 'weak', volatility: 0.21, trend: -0.018, upChance: 0.35 },
  'חיים מרקס': { type: 'weak', volatility: 0.17, trend: -0.010, upChance: 0.42 },
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
      const profile = stockProfiles[stock.member_name] || { type: 'medium', volatility: 0.15, trend: 0, upChance: 0.50 };
      
      let changePercent = 0;
      const rand = Math.random();
      
      if (rand < profile.upChance) {
        changePercent = Math.random() * profile.volatility;
      } else {
        changePercent = -(Math.random() * profile.volatility);
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