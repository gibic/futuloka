import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/fireBaseConfig'; // Adjust path as needed
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  try {
    // Check if email already exists
    const emailsRef = collection(db, 'emails');
    const q = query(emailsRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
    }

    // Add email to Firestore
    await addDoc(emailsRef, { email });

    return NextResponse.json({ message: 'Form submission successful' }, { status: 200 });
  } catch (error) {
    console.error('Error saving email:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
