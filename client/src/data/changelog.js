export const changelogData = [
  {
    version: "2.1.1",
    date: "2026-03-15",
    title: "Edit Mode Sync Fix ⚡",
    changes: [
      "🐛 Fixed a bug where rapidly tapping multiple past days in Edit Mode would cause some edits to not sync."
    ]
  },
  {
    version: "2.1.0",
    date: "2026-03-15",
    title: "Sync & Update Hardening 🛡️",
    changes: [
      "🔄 Cross-Device Reset: Resetting history on one device now properly syncs to all your other devices.",
      "🔁 Smart Retry: If syncing fails (network issues), the app now retries automatically up to 3 times.",
      "📌 Persistent Update Banner: Dismissing an app update prompt now re-shows it when you return — no more missed updates.",
      "🛡️ API Cache Guard: Ensured the service worker never caches API calls, preventing stale sync data.",
      "🧹 Minor: Fixed a resource leak in the update checker."
    ]
  },
  {
    version: "2.0.0",
    date: "2026-03-15",
    title: "Sync Engine V2 ⚡",
    changes: [
      "🔄 Rebuilt Sync Engine: Your data now syncs smarter using a Last-Write-Wins strategy.",
      "📡 Bi-Directional Sync: Send and receive changes in one shot — faster and more reliable.",
      "🛡️ Conflict Protection: If two devices edit the same day, the latest edit always wins.",
      "🔒 Atomic Merges: Conflict resolution happens at the database level for maximum safety.",
      "⏰ Clock Guard: Prevents bad timestamps from corrupting your data."
    ]
  },
  {
    version: "1.4.15",
    date: "2026-02-15",
    title: "Level Up & Polish 🚀",
    changes: [
      "🏆 Consistency Tiers: Are you Elite or Pro? Check your new status badge.",
      "🌑 Native Dark Mode: The status bar now blends perfectly with the app theme.",
      "📊 Layout Upgrade: Prioritized Consistency Score for better focus."
    ]
  },
  {
    version: "1.4.14",
    date: "2026-02-15",
    title: "Sync Fortification 🏰",
    changes: [
      "🛡️ Smart Data Merge: Fixed an issue where offline data could be lost during sync.",
      "📶 Offline Protection: Your local history now takes priority to prevent overwrites.",
      "🎨 UI Polish: Reordered statistics cards for better readability."
    ]
  },
  {
    version: "1.4.13",
    date: "2026-01-24",
    title: "Update Experience Improvement 🔄",
    changes: [
      "🔔 Smarter Update Prompt: If you close the update message, it will reappear next time you reopen the app.",
      "♻️ Reliable App Updates: Ensures new versions are applied properly without needing to reinstall the app.",
      "🧠 Improved Update Handling: Keeps the app up to date while avoiding interruptions during use."
    ]
  },
  {
    version: "1.4.12",
    date: "2026-01-24",
    title: "Safety & Control Update 🛡️",
    changes: [
      "✨ Global Error Boundary: No more white screens if the app crashes.",
      "☢️ Danger Zone: Added 'Reset History' in Settings.",
      "📊 Contextual Stats: Stats now update based on the month you view.",
      "🔧 Fixed: Calendar flickering issues."
    ]
  },
  {
    version: "1.4.9",
    date: "2026-01-20",
    title: "Rebranding Update",
    changes: [
      "🎨 Renamed app to Gym-Log.",
      "⚡ Improved load times with Skeleton screens."
    ]
  }
];