# 🌾 Willow Farm Stand

**A modern storefront for a small farm to sell produce online — no marketplace fees, no middleman.**

Willow Farm Stand is a lightweight ordering platform built for direct-from-farm sales. Shoppers browse what's fresh, add it to a running cart, and check out with a pickup or delivery request. Behind the scenes, the farmer gets a real dashboard to manage the sale list, track incoming orders, and watch inventory update automatically as things sell — all without spreadsheets, group texts, or a third-party marketplace taking a cut.

## Who it's for

- **Small farms & farm stands** who want to take orders online instead of over the phone or via a sign-up sheet.
- **CSA-style or pop-up sellers** who need a simple way to publish "what's available this week" and stop selling items once they're gone.
- **Shoppers** who want a fast, no-account-needed way to see what's fresh and place an order for pickup or delivery.

## What it does

### 🛒 For shoppers — the Market
- Browse the day's harvest as photo cards with price, unit (lb, bunch, dozen, etc.), and freshness notes like *"Picked Today"* or *"Farmer's Favorite."*
- Search and filter by category — Vegetables, Fruits, Herbs, Roots, Pantry & Eggs.
- Add items to a cart that persists in the browser, so a shopper's order survives a page refresh.
- See a live running total as items are added or adjusted.
- Check out with name, phone, and either a pickup time or a delivery address.
- Get an instant order confirmation with a summary of what was ordered.
- Sold-out items are automatically hidden from checkout the moment stock hits zero — no overselling.

### 🚜 For the farmer — the Dashboard
- **Sale List** — add, edit, and remove produce listings, set prices and stock levels, mark items organic, and quick-restock with one tap.
- **Orders** — see every incoming order, filter by status, and move orders through a fulfillment pipeline: *New → Packing → Ready → Completed* (or cancel).
- **Inventory at a glance** — live stats on total listings, units in stock, low-stock warnings, sold-out counts, total orders, and total revenue.
- Every sale automatically deducts from inventory in real time — no manual reconciliation needed.

## How it works

The storefront and dashboard are two views of the same live catalog: when a shopper places an order, the farmer's inventory and stats update immediately, and when the farmer changes a price or pulls a sold-out item, the market view reflects it right away. Orders and inventory are persisted centrally, so the farmer isn't relying on a spreadsheet or a shopper's memory of what they asked for.

## Getting started

```bash
npm install
cp .env.example .env   # add your configuration
npm run dev
```

The app runs at `http://localhost:3000` — the market view loads by default, with the farmer dashboard accessible from the header.

## Tech stack

Built with React 19, TypeScript, Vite, Tailwind CSS, and an Express backend with a persisted JSON data store — a deliberately small footprint so it's easy to self-host or extend.
