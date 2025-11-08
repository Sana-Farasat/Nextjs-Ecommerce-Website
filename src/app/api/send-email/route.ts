// app/api/send-email/route.ts (Nodemailer wala, same)
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export async function POST(req: NextRequest) {
  const { to, subject, text } = await req.json();
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
  return NextResponse.json({ success: true });
}