## Problem Statement

The user wants a calm, simple daily habit tracker dashboard for personal wellness that helps them complete today's habits faster without adding backend, account, or setup complexity. Existing habit-tracking tools often feel too heavy, too generic, or too analytics-focused for a quick daily check-in, so the user needs a single-page experience that makes logging today's progress feel lightweight, clear, and visually motivating.

## Solution

Build a single-user, single-device habit tracker dashboard in React and TypeScript that stores daily entries in `localStorage`. The product should focus on fast daily input for a default set of wellness habits, surface passive reminder cues, show goal-based status and color feedback, and provide a lightweight 7-day summary for motivation. The experience should feel calm and uncluttered, with no backend, authentication, notifications, or editable historical records in v1.

## User Stories

1. As a single user, I want to open the app and immediately see today's check-in dashboard, so that I can log progress without navigating through extra screens.
2. As a single user, I want the dashboard to show today's date clearly, so that I know I am recording the current day's habits.
3. As a single user, I want my data to stay saved in the browser, so that I don't lose my entries when I refresh the page.
4. As a single user, I want the app to automatically store data by calendar date, so that each day has its own record.
5. As a single user, I want to log my wake-up time, so that I can track whether I started the day on schedule.
6. As a single user, I want to log yoga minutes, so that I can record movement with more detail than a yes/no checkbox.
7. As a single user, I want to log hydration as glasses consumed, so that I can see progress toward a daily water goal.
8. As a single user, I want to log total sleep hours, so that I can quickly assess whether I rested enough.
9. As a single user, I want these habits to come preconfigured in v1, so that I can use the app immediately without setting anything up.
10. As a single user, I want those four habits treated as the initial default set, so that the product can grow later without changing the meaning of v1.
11. As a single user, I want the dashboard to highlight progress toward simple daily goals, so that I can tell at a glance what is on track.
12. As a single user, I want wake-up progress judged against a default target time, so that I understand whether I met my morning goal.
13. As a single user, I want yoga progress judged against a default minutes target, so that I know whether I completed enough movement for the day.
14. As a single user, I want hydration progress judged against a default glasses goal, so that I can see what remains.
15. As a single user, I want sleep progress judged against a default hours goal, so that I can quickly assess recovery.
16. As a single user, I want the app to show passive reminder cues, so that I notice missing habits without feeling nagged.
17. As a single user, I want reminder cues to stay on the dashboard instead of appearing as browser notifications, so that the experience remains calm and unobtrusive.
18. As a single user, I want the app to show a compact overall progress summary, so that I can see how many goals I have met today.
19. As a single user, I want each habit card to show a clear status, so that I know which habits are complete and which still need attention.
20. As a single user, I want the sleep module to use color coding, so that low, medium, and strong sleep performance are visually obvious.
21. As a single user, I want sleep of 8 hours or more to appear green, so that strong sleep is positively reinforced.
22. As a single user, I want sleep from 6 to under 8 hours to appear yellow, so that I can recognize moderate sleep without reading detailed text.
23. As a single user, I want sleep under 6 hours to appear red, so that low sleep stands out clearly.
24. As a single user, I want the dashboard to feel calm and wellness-oriented, so that logging habits feels supportive rather than stressful.
25. As a single user, I want the UI to stay simple, so that I can finish my check-in in a few moments.
26. As a single user, I want hydration entry to be easy to adjust, so that I can increment progress throughout the day.
27. As a single user, I want yoga minutes and sleep hours to support lightweight numeric input, so that the app remains structured but not complex.
28. As a single user, I want wake-up time to use a time-based input, so that my morning entry is easy and precise.
29. As a single user, I want a reset option for today's data, so that I can quickly clear and re-enter the current day if needed.
30. As a single user, I want to see the last 7 days summarized, so that I get a little context without losing the today-first focus.
31. As a single user, I want the 7-day view to be lightweight and read-only, so that it motivates me without introducing history management complexity.
32. As a single user, I want each recent day to show a one-line summary, so that I can understand recent habits quickly.
33. As a single user, I want the app to emphasize today over historical trends, so that version 1 stays focused on immediate action.
34. As a single user, I want the app to work entirely without accounts or sync, so that it remains private and easy to use on one device.
35. As a single user, I want the product scope to exclude cloud features in v1, so that the implementation stays lightweight and maintainable.
36. As a future user, I want the PRD to leave space for streaks later, so that motivation features can be added without redefining the core app.
37. As a future user, I want the PRD to leave space for export later, so that historical data can eventually be reused outside the app.
38. As a future user, I want the PRD to leave space for configurable habits later, so that the app can evolve beyond the default four habits.
39. As a developer, I want the core business logic separated from the UI, so that the app is easier to test and maintain.
40. As a developer, I want daily-entry storage abstracted behind a simple interface, so that local persistence can change later without rewriting the UI.
41. As a developer, I want goal evaluation logic isolated, so that status calculations remain consistent across cards, reminders, and summaries.
42. As a developer, I want reminder generation isolated, so that the tone and trigger rules can evolve independently of rendering.
43. As a developer, I want history summarization isolated, so that recent-day summaries remain predictable and testable.
44. As a developer, I want a small set of UI behavior tests for the main check-in flow, so that the app's key interactions remain stable while avoiding over-testing presentation details.

## Implementation Decisions

- The product is a single-page React + TypeScript application.
- The product is strictly single-user and private on one device for v1.
- Persistence uses browser `localStorage` only.
- Data is stored by date key using a daily-record model.
- The primary success metric for v1 is helping the user complete today's habits faster, not deep historical analysis.
- The initial default habit set is wake-up time, yoga minutes, hydration glasses, and sleep hours.
- The default habits are fixed for v1, but positioned as an initial set rather than a permanent limitation.
- Reminders are passive, in-context dashboard cues rather than active browser notifications or escalating prompts.
- The 7-day history is read-only and intended as a lightweight motivational summary.
- Historical entries are not editable in v1.
- Goal thresholds are defined in the product behavior for v1 defaults: wake-up before `7:00 AM`, yoga `20` minutes, hydration `8` glasses, and sleep `8` hours.
- Sleep status includes explicit color-coded thresholds: green for `>= 8`, yellow for `>= 6` and `< 8`, and red for `< 6`.
- The implementation should be decomposed into deeper modules instead of leaving all logic inside the UI: daily-entry storage, goal evaluation, reminder generation, history summarization, and a UI composition layer for rendering and interaction wiring.
- The architecture should favor simple, testable interfaces around the pure logic rather than embedding business rules directly in components.
- The UI should preserve a calm wellness aesthetic and avoid aggressive productivity patterns.

## Testing Decisions

- Good tests should verify observable behavior and stable outputs rather than internal implementation details.
- Pure logic modules should be tested first because they contain the key product rules and are easiest to validate deterministically.
- The most important logic to test includes date-keyed entry handling, goal evaluation, sleep color threshold classification, reminder generation, and 7-day summary construction.
- A small number of UI behavior tests should cover the main daily check-in flow, including loading today's dashboard, updating habit inputs, showing persisted values after reload or setup, and displaying reminder and status changes based on input.
- UI tests should focus on user-visible behavior, not CSS implementation or component internals.
- There is little or no existing first-party app test prior art in the repo, so the test plan should establish lightweight conventions appropriate for a small Vite/React app.

## Out of Scope

- User accounts
- Multi-user support
- Cloud sync
- Backend services
- Push or browser notifications
- Editable historical entries
- Advanced analytics and charts
- Habit configuration and custom habit creation
- Cross-device data sharing
- Export functionality
- Streak tracking
- Deep reporting or long-term trend analysis

## Further Notes

- The current implementation direction already aligns with much of this PRD, but the architecture should be deepened so the core logic is not concentrated in a single UI component.
- The product should remain intentionally small in v1; simplicity is a feature, not a temporary shortcut.
