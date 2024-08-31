"use client";

import { useFormik } from 'formik';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useMutation } from 'react-query';
import Logo from '../../public/logo.png';
import Illustration from '../../public/illustration.png';
import Alert from '../components/Alert'; // Import the Alert component

export default function Home() {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      console.error('reCAPTCHA site key is not defined');
      return;
    }

    // Load reCAPTCHA v3 script and execute it
    const loadReCaptchaScript = () => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.onload = () => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            window.grecaptcha
              .execute(siteKey, { action: 'submit' })
              .then((token) => {
                setRecaptchaToken(token);
              });
          });
        }
      };
      document.body.appendChild(script);
    };

    loadReCaptchaScript();
  }, []);

  const mutation = useMutation(
    async (formData: { email: string; recaptchaToken: string | null }) => {
      return axios.post('/api/subscribe', formData);
    },
    {
      onSuccess: () => {
        setAlertMessage('Thank you for subscribing!');
        setAlertType('success');
        formik.resetForm(); // Reset the form after successful submission
      },
      onError: (error: any) => {
        if (axios.isAxiosError(error) && error.response?.data.message) {
          if (error.response.data.message === 'Email already exists') {
            setAlertMessage('This email is already subscribed. Please use a different email.');
            setAlertType('error');
          } else {
            setAlertMessage('There was an error submitting your form. Please try again.');
            setAlertType('error');
          }
        } else {
          setAlertMessage('An unexpected error occurred. Please try again.');
          setAlertType('error');
        }
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    onSubmit: (values) => {
      if (!recaptchaToken) {
        setAlertMessage('Please verify that you are not a robot.');
        setAlertType('error');
        return;
      }
      mutation.mutate({ email: values.email, recaptchaToken });
    },
  });

  const closeAlert = () => {
    setAlertMessage(null);
    setAlertType(null);
  };

  return (
    <main className="bg-primary flex min-h-screen flex-col items-center p-4 gap-20 lg:p-24">
      <h1 className="hidden">Futuloka - Forthcoming Art Influx</h1>
      <Image src={Logo} alt="Futuloka logo" width={300} />

      <form onSubmit={formik.handleSubmit} className="flex flex-col items-center">
        <h2>Submit your email to stay updated</h2>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          onChange={formik.handleChange}
          value={formik.values.email}
          className="w-full my-2 p-2 border"
          required
        />
        <button
          type="submit"
          className="text-white p-2 w-full mt-2 bg-blue-700 rounded-sm"
          disabled={mutation.isLoading} // Disable the button while loading
        >
          {mutation.isLoading ? 'Submitting...' : 'Subscribe'}
        </button>
      </form>

      <Image src={Illustration} alt="Illustration" width={400} className="max-w-48 lg:max-w-96 lg:block absolute bottom-1 right-1" />

      {alertMessage && alertType && (
        <Alert message={alertMessage} type={alertType} onClose={closeAlert} />
      )}
    </main>
  );
}
