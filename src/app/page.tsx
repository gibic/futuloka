"use client";

import { useFormik } from 'formik';
import axios from 'axios';
import { useState } from 'react';
import Image from 'next/image';
import Logo from '../../public/logo.png';
import Illustration from '../../public/illustration.png';
import ReCAPTCHA from 'react-google-recaptcha';

export default function Home() {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    onSubmit: async (values) => {
      if (!recaptchaToken) {
        alert('Please verify that you are not a robot.');
        return;
      }
      try {
        await axios.post('/api/subscribe', { ...values, recaptchaToken });
        alert('Thank you for subscribing!');
      } catch (error) {
        console.error('Failed to submit form:', error);
        alert('There was an error submitting your form. Please try again.');
      }
    },
  });

  return (
    <main className="bg-primary flex min-h-screen flex-col items-center justify-between p-24">
      <Image src={Logo} alt="Futuloka logo" width={300} />
      
      <form onSubmit={formik.handleSubmit} className="flex flex-col items-center">
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          onChange={formik.handleChange}
          value={formik.values.email}
          className="mb-4 p-2 border"
          required
        />
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
          onChange={handleRecaptchaChange}
        />
        <button type="submit" className="bg-blue-500 text-white p-2 mt-4">
          Subscribe
        </button>
      </form>

      <Image src={Illustration} alt="Illustration" width={400} className="absolute bottom-1 right-1" />
    </main>
  );
}
