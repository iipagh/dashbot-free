# DashBot AI Assistant

Build a production-ready AI SaaS web application called **DashBot AI**.

# Main Heading

Display the following heading prominently at the top of the homepage:

**DashBot, Your Personal AI Assistant**

Create a modern, premium-looking interface using a sky-blue and white color palette with glassmorphism, soft shadows, rounded corners, smooth animations, and a fully responsive layout.

---

# Technology Stack

Use:

- React

- TypeScript

- Vite

- Tailwind CSS

- Supabase

- OpenAI API

- RevenueCat Web SDK

Use reusable components and maintain a clean folder structure.

---

# Authentication

Use Supabase Authentication.

Support:

- Email Sign Up

- Email Login

- Google Login

- Forgot Password

- Logout

Each user must have their own secure account.

Store:

- Name

- Email

- Profile Picture

- Subscription Status

- Remaining Free Messages

- Chat History

- Generated Images

- Generated Videos

Protect all authenticated pages.

---

# Homepage

Navigation Bar

Include:

- DashBot AI Logo

- Home

- Features

- Pricing

- About

- Login

- Get Started

Hero Section

Title:

DashBot, Your Personal AI Assistant

Subtitle:

Chat with AI, generate stunning images, create AI videos, and boost productivity with one intelligent assistant.

Buttons:

- Start Chatting

- View Pricing

Add modern background gradients, floating shapes, and smooth entrance animations.

---

# AI Chat

Create a ChatGPT-style interface.

Sidebar:

- New Chat

- Chat History

- Search Chats

- Delete Chat

- Settings

Main Chat Area

Include:

- User message bubbles

- AI message bubbles

- Markdown rendering

- Code blocks

- Copy response

- Regenerate response

- Auto-scroll

- Streaming responses

- Typing indicator

- Loading animations

Input Area

Support:

- Multiline input

- Enter to send

- Shift+Enter for new line

- Send button

- Character counter

Conversation history should automatically save to Supabase.

---

# AI Image Generation

Users can generate AI images from text prompts.

Support:

Styles:

- Realistic

- Anime

- Cartoon

- Digital Art

- Fantasy

- Painting

Image Sizes:

- Square

- Portrait

- Landscape

Display generated images inside chat.

Allow:

- Download

- Regenerate

Save image history to the user's account.

---

# AI Video Generation

Allow users to generate AI videos.

Users can choose:

- Duration

- Style

- Quality

Show:

- Progress indicator

- Loading animation

- Finished video preview

Allow downloading.

Store video history.

---

# Free Plan

Guests receive:

- 100 free AI messages

When the free limit is reached:

- Prompt users to sign up or log in.

After logging in, continue tracking message usage.

If the free allowance is exhausted, display the RevenueCat paywall.

---

# RevenueCat Subscription

Integrate the RevenueCat Web SDK.

Create:

Entitlements

- Free

- Pro

Offerings

- Monthly Pro

- Yearly Pro

When a user upgrades successfully:

Unlock:

- Unlimited AI chat

- Unlimited image generation

- Unlimited video generation

- Faster AI responses

- No usage limits

Automatically sync subscription status whenever the user logs in.

If a subscription expires, revert the user to the Free plan automatically.

---

# Pricing Page

Create three pricing cards.

Free

- 100 AI messages

- Standard AI chat

Pro Monthly

- Unlimited chat

- Unlimited images

- Unlimited videos

- Priority AI responses

Pro Yearly

- Everything in Monthly

- Discount badge

- Most Popular badge

Add attractive hover animations.

---

# Profile Page

Display:

- Avatar

- Name

- Email

- Current Plan

- Subscription Status

- Remaining Free Messages

- Usage Statistics

- Renewal Date (for Pro users)

Allow users to:

- Edit Profile Picture

- Change Display Name

---

# Settings

Allow users to:

- Switch between Light and Dark Mode

- Change Language

- Export Chat History

- Delete Account

- Log Out

---

# Database (Supabase)

Create tables:

profiles

subscriptions

chat_history

messages

usage

generated_images

generated_videos

Use Row Level Security (RLS) so users can only access their own data.

---

# AI Integration

Use the OpenAI API.

Support:

- Long conversations

- Context memory

- Markdown

- Code generation

- Math formatting

- Tables

- Lists

- Streaming responses

---

# Security

- Store all API keys in environment variables.

- Never expose secret keys to the client.

- Validate all authenticated requests.

- Protect premium features based on RevenueCat entitlements.

---

# Performance

- Lazy-load heavy components.

- Optimize images.

- Use code splitting.

- Minimize unnecessary re-renders.

- Ensure fast loading on desktop, tablet, and mobile.

---

# SEO

Add:

- Meta Title

- Meta Description

- Open Graph tags

- Twitter Card tags

- Favicon

- Sitemap

- Robots.txt

---

# Footer

Include:

- About

- Pricing

- Privacy Policy

- Terms of Service

- Contact

Display copyright information.

---

# Design Requirements

- Premium SaaS appearance

- Sky blue and white theme

- Rounded corners

- Glassmorphism effects

- Smooth animations

- Beautiful icons

- Professional typography

- Fully responsive

- Accessible UI

- Consistent spacing

- Fast and polished user experience

---

# Final Requirement

Generate clean, production-ready code using React, TypeScript, Tailwind CSS, Supabase, OpenAI, and RevenueCat.

The application should be modular, scalable, secure, responsive, and deployment-ready.

Do not include an Admin Panel or any administrator dashboard.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://dashbot-free.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/00d645be-079b-4973-bca0-9c9ca9118375).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
