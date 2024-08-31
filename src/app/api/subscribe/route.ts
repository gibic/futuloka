// app/api/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and ANON KEY must be defined');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
  const { email, recaptchaToken } = await req.json();

  if (!recaptchaToken) {
    return NextResponse.json({ message: 'reCAPTCHA token is missing' }, { status: 400 });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

  try {
    const { data } = await axios.post(verificationUrl);

    if (!data.success || data.score < 0.5) {
      return NextResponse.json({ message: 'reCAPTCHA validation failed' }, { status: 400 });
    }

    // Save email to Supabase
    const { error } = await supabase.from('emails').insert([{ email }]);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Form submission successful' }, { status: 200 });
  } catch (error) {
    console.error('Error verifying reCAPTCHA or saving email:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
