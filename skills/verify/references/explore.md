# Exploratory testing

One session per unit: a charter, the findings and what each became. It complements scripted
scenarios, never replaces them.

## Steps

1. **Write the charter first** — mission, resources, the information you are after, the
   risk behind it, and a time box:

   ```markdown
   ## Charter · 2026-09-16 · 45 min
   Explore **applying coupons at checkout** with **an account with orders in progress and
   valid, expired and used codes** to discover **whether the total and the order can get out
   of step**. Risk: money shown differing from money charged.
   ```

2. **Explore inside the box.** Vary deliberately: twice, out of order, interrupted, back
   button, extreme data. Keep a running note of what you did. Something interesting outside
   the mission becomes a new charter, not a detour. Data you create is cleaned up at the end
   (`test-data.md`); what could not be is noted.
3. **Classify against requirements, never taste**, as `bug.md` defines a defect. An
   unreproduced near miss is written down as such.
4. **Report**, including what you did not cover:

   ```markdown
   ## Session 2026-09-16 · 45 min · coupons at checkout
   - **Found:** BUG-007, BUG-008, Q-15, 1 usability note.
   - **New charters:** cancelling an order with a redeemed coupon.
   - **Covered:** applying, rejecting, re-applying, applying after editing.
   - **Not covered:** concurrent sessions — no second account.
   ```

## Done when

Someone could repeat the session and know what you already ruled out.
