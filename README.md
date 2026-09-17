# 🌾 Willow Farm Stand

A class project prototype: a simple online storefront where a small farm could sell produce directly to customers, without listing on a marketplace app.

**Live site:** https://grocerysale.vercel.app

## What this is

Willow Farm Stand lets a shopper browse a farm's available produce, put items in a cart, and submit an order for pickup or delivery. On the other side, the farmer has a dashboard to add and edit what's for sale, see incoming orders, and track stock — all sharing the same live data, so when something sells out, the shopper-facing page updates right away.

This is a prototype built to explore an idea, not a finished commercial product. See "What's unfinished" below for what's still missing.

## Who it's for

This project is a portfolio/coursework piece meant to demonstrate a full, working shopping flow — from browsing to checkout to order management — built from scratch. It's shared here for classmates, instructors, and anyone (including potential employers) interested in seeing the code and how it works.

## Try it yourself: step by step

**As a shopper:**
1. Go to the [live site](https://grocerysale.vercel.app). You'll land on the "Produce Market" view.
2. Browse the produce cards, or use the category filter (Vegetables, Fruits, Herbs, Roots, Pantry & Eggs) to narrow things down.
3. Click a card to add it to your cart. Adjust quantity from the cart drawer (the cart icon, usually top right).
4. Optional: with items in your cart, open "Farm Basket Recipes" from the cart drawer to get recipe ideas built around what you picked.
5. When ready, fill in your name, phone number, and either a pickup time or a delivery address, then submit the order.
6. You'll see an order confirmation summarizing what you ordered. Nothing is actually charged — this is a request, not a paid checkout (see below).

**As the farmer:**
1. Click "Farmer Manager" in the header to switch views.
2. **Produce Sale List** tab — add a new item, edit price/stock/description, or mark something organic. There's a quick-restock option for items running low.
3. **Orders** tab — see every order that's come in and move it through a status pipeline: New → Packing → Ready → Completed (or cancel it).
4. **Inventory** tab — see totals at a glance: how much stock is out, what's low or sold out, how many orders have come in, and total revenue.

Anything a shopper does (like buying the last of an item) shows up immediately in the farmer's view, and anything the farmer changes (like a new price) shows up immediately for shoppers.

## How it works, in plain language

The site is one shared list of produce and orders that both views (shopper and farmer) read from and write to, so there's no delay or manual syncing between them. When you check out, the site checks that there's still enough stock, subtracts what you bought, and marks an item "sold out" once it hits zero.

### The AI part

The "Farm Basket Recipes" feature looks at whatever produce is currently in your cart and asks Google's Gemini AI to write three custom recipes built around those specific ingredients — including prep time, steps, and a chef's tip.

**Where it falls short:**
- If the AI service is slow, unavailable, or returns something unusable, the site quietly falls back to a small set of pre-written recipes instead. You can tell which one you got from a small badge: "AI Farm Chef" (real AI) vs. "Willow Creek Kitchen" (fallback).
- The AI writes something new every time you click "Get Fresh Ideas," so recipes aren't reviewed by a person — they can occasionally be repetitive, mismatched to the season, or just a little odd.
- It only knows what's in your cart. It doesn't know what's actually in your kitchen pantry, doesn't account for allergies beyond the dietary filter you pick, and won't catch a factual cooking mistake if the AI makes one.

## What's unfinished

This is a prototype, so a few things are intentionally incomplete:

- **No real payment processing.** Orders are requests only — the farmer would still need to collect payment separately (e.g., cash or card at pickup/delivery).
- **No login for the farmer dashboard.** Right now, anyone who visits the site can click "Farmer Manager" and see or edit the sale list and orders. A real version would need a password or account system to lock that down.
- **Shared data, simple storage.** All data (produce and orders) is saved to one shared file rather than a proper database. That's fine for a demo with one visitor at a time, but it isn't built to handle many people using it at once or to scale up.
- **No email/text notifications.** Orders are visible in the dashboard, but nothing automatically texts or emails the farmer or the customer when an order's status changes.

## Tools used to build this

- **React** + **TypeScript** — the interface
- **Vite** — the build tool that runs the app during development and bundles it for deployment
- **Tailwind CSS** — styling
- **Express** — the backend server that stores produce and orders and talks to the AI
- **Google Gemini API** — powers the AI recipe suggestions
- **Vercel** — hosting for the live site

## Running it locally

```bash
npm install
cp .env.example .env   # add your own Gemini API key if you want the AI recipes to work
npm run dev
```

The app runs at `http://localhost:3000`. Without a Gemini API key, the recipe feature still works — it just always uses the pre-written fallback recipes instead of AI-generated ones.
