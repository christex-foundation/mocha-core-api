//@ts-check
import { createSupabaseClient } from '../utils/supabase.mjs';
const supabase = createSupabaseClient();

export async function createIntent(from_number) {
  try {
    const { data, error } = await supabase
      .from('intents')
      .insert({
        from_number: from_number,
        client_secret: `client_secret_${from_number}`,
      })
      .select();
    if (error) {
      console.log(error);
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}

export async function updateIntent(
  id,
  from_number,
  to_number,
  amount,
  currency,
  description,
  cancelation_reason,
  payment_method,
  amount_received,
) {
  try {
    const { data, error } = await supabase
      .from('intents')
      .update({
        from_number: from_number,
        to_number: to_number,
        amount: amount,
        currency: currency,
        description: description,
        cancelation_reason: cancelation_reason,
        payment_method: payment_method,
        amount_received: amount_received,
      })
      .eq('id', id)
      .select();
    if (error) {
      console.log(error);
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}

export async function fetchAllIntents() {
  try {
    const { data, error } = await supabase.from('intents').select();
    if (error) {
      console.log(error);
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}

export async function fetchAllUserIntents(from_number) {
  try {
    const { data, error } = await supabase.from('intents').select().eq('from_number', from_number);
    if (error) {
      console.log(error);
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}

export async function fetchIntentById(id) {
  try {
    const { data, error } = await supabase.from('intents').select().eq('id', id);
    if (error) {
      console.log(error);
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}

export async function confirmIntent(id, from_number) {
  try {
    //fetch the intent
    const { data: intent, error: fetchError } = await supabase
      .from('intents')
      .select('*')
      .eq('id', id)
      .eq('client_secret', `client_secret_${from_number}`)
      .single();

    if (fetchError) {
      console.error('Error fetching intent:', fetchError);
      return fetchError;
    }

    const requiredFields = ['amount', 'amount_received', 'currency', 'from_number', 'to_number'];
    const missingFields = requiredFields.filter((field) => !intent[field]);

    if (missingFields.length > 0) {
      const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
      console.error(errorMessage);
      return { error: errorMessage };
    }

    const { data, error } = await supabase
      .from('intents')
      .update({
        confirmed_at: new Date(),
      })
      .eq('id', id)
      .eq('client_secret', `client_secret_${from_number}`)
      .select();
    if (error) {
      console.error('Error updating intent:', error);
      return error;
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}

export async function cancelIntent(id) {
  try {
    const { data, error } = await supabase
      .from('intents')
      .update({
        cancelled_at: new Date(),
        cancellation_reason: 'User cancelled',
      })
      .eq('id', id);
    if (error) {
      console.log(error);
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}

//The search function currenctly only searches by description and cancellation reason
//But we can add more fields in the future
export async function searchIntents(query) {
  try {
    const { data, error } = await supabase
      .from('intents')
      .select()
      .or(`description.ilike.%${query}%,cancellation_reason.ilike.%${query}%`);
    if (error) {
      console.log(error);
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}

export async function deleteIntent(id) {
  try {
    const { data, error } = await supabase.from('intents').delete().eq('id', id);
    if (error) {
      console.log(error);
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}
