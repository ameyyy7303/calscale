# CalScale (VIBECODED)

Your MacBook's trackpad is a pressure sensor. We turned it into a kitchen scale. Then we connected it to every food in America.

**Live:** [calscale.vercel.app](https://calscale.vercel.app)

## What this is

A calorie tracking web app with a party trick: it weighs your food using the Force Touch trackpad built into every modern MacBook. The trackpad's pressure sensors were designed for fancy click gestures. We repurposed them.

Place item on trackpad. Touch with finger. Read weight. Log calories. Done.

The food database has 300,000+ entries from USDA FoodData Central — every branded product on US shelves. Great Value. Kirkland. Whatever your grocery store carries. It's in there.

## How the scale works

Apple's Force Touch trackpad has strain gauge sensors under the glass that measure pressure with surprising precision. The native [TrackWeight](https://github.com/KrishKrosh/TrackWeight) app by Krish Shah proved this works — the raw pressure data comes back in grams.

In the browser we're one layer removed. Safari exposes `webkitmouseforcechanged` events with a `webkitForce` property (0 to ~3 range). We normalize this to weight. It's not lab-grade. It's better than guessing.

The flow:
1. Touch the scale area (your finger provides the capacitance the trackpad needs)
2. Tap **Tare** to zero out your finger's weight
3. Place your item — the reading is just the object

Works up to ~3.5kg. Use Safari for best results. Chrome has limited pressure support.

## The stack

Everything here is free tier.

| What | With what |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Charts | Recharts |
| Database | Neon (PostgreSQL, free tier) |
| ORM | Prisma |
| Food data | USDA FoodData Central API (free, 300K+ foods) |
| Pressure | WebKit Force Touch events + PointerEvent fallback |
| Deploy | Vercel (free tier) |

No auth. No accounts. No friction. You open it and start tracking.

## Running locally

```bash
git clone https://github.com/ameyyy7303/calscale.git
cd calscale
npm install
```

Create `.env.local`:
```
DATABASE_URL="your-neon-connection-string"
DIRECT_URL="your-neon-direct-connection-string"
USDA_API_KEY="DEMO_KEY"
```

Get a free Neon database at [neon.tech](https://neon.tech). Get a free USDA API key at [fdc.nal.usda.gov/api-key-signup](https://fdc.nal.usda.gov/api-key-signup). `DEMO_KEY` works but has lower rate limits.

```bash
npx prisma db push
npm run dev
```

Open [localhost:3000](http://localhost:3000). Go to `/scale` in Safari.

## Features

- **Trackpad scale** — Weigh items 0-3.5kg using Force Touch. Tare function subtracts finger weight. Calibration support.
- **Food search** — 300,000+ foods from USDA including all major US brands. Debounced search, instant results.
- **Meal logging** — Breakfast, lunch, dinner, snacks. Portion sizes in grams, oz, or servings.
- **Dashboard** — Daily calorie ring, macro progress bars (protein, carbs, fat, fiber), per-meal breakdowns.
- **Analytics** — Weekly and monthly calorie trends, stacked macro charts, averages.
- **Settings** — Daily goals (calories + macros), dark/light/system theme.

## Limitations

Be honest about what this is:

- **The scale needs your finger on the trackpad.** The browser can only read pressure when it detects capacitance (touch). You can't just drop something on the trackpad and get a reading.
- **Safari only for real pressure data.** Chrome's PointerEvent.pressure is severely limited on trackpads.
- **It's approximate.** WebKit's force values are normalized, not raw gram readings. The native TrackWeight app has direct access to MultitouchSupport framework data. We don't. Calibrate against a known weight for better accuracy.
- **Metal objects** may register as touch. Put paper between metal items and the trackpad.

## Credits

- [TrackWeight](https://github.com/KrishKrosh/TrackWeight) by Krish Shah — proved the concept, inspired the approach
- [USDA FoodData Central](https://fdc.nal.usda.gov/) — the food database
- [shadcn/ui](https://ui.shadcn.com/) — the component library
- Built with Claude Code

## License

MIT — do whatever you want with it.
