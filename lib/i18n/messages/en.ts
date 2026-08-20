// The canonical key set. it.ts is typed against this file's keys (see it.ts),
// so adding a key here without its Italian counterpart is a build error, not
// a silent English fallback discovered later in the browser.
//
// Keys are flat and dot-joined ("nav.logOut") rather than nested objects —
// closer to NSLocalizedString/String(localized:) than a selector-based typed
// accessor, which matters here since this codebase's audience is an
// iOS-first developer.
export const en = {
  "nav.home": "Home",
  "nav.programs": "Programs",
  "nav.history": "History",
  "nav.logOut": "Log out",

  "login.subtitle": "Sign in to continue",
  "login.googleFailed": "Google login failed",
  "login.devFailed": "Login failed",

  // Shared across pages — status words, generic actions, and units common
  // enough to appear in more than one namespace below.
  "common.retry": "Retry",
  "common.dismiss": "Dismiss",
  "common.back": "Back",
  "common.completed": "Completed",
  "common.inProgress": "In progress",
  "common.reps": "reps",

  "home.resumeWorkout": "Resume your workout",
  "home.currentProgram": "Current program",
  "home.upNext": "Up next · Week {week}",
  "home.start": "Start",
  "home.allDone": "Every workout in this program is done. Nice work.",
  "home.viewFullProgram": "View full program",
  "home.recentActivity": "Recent activity",

  "program.noneAssigned": "No programs assigned yet. Ask your coach!",
  "program.myPrograms": "My Programs",
  "program.starts": "Starts {date}",
  "program.notFound": "Program not found",
  "program.week": "Week {position}",
  "program.noWorkoutsThisWeek": "No workouts this week",
  "program.status.active": "Active",
  "program.status.paused": "Paused",

  "workout.loadFailed": "Could not load this workout",
  "workout.startFailed": "Could not start the workout",
  "workout.noActiveSession": "No active session",
  "workout.addSetFailed": "Could not add that set",
  "workout.saveSetFailed": "Could not save that set",
  "workout.removeSetFailed": "Could not remove that set",
  "workout.completeFailed": "Could not complete the workout",
  "workout.notFound": "Workout not found",
  "workout.resumedInProgress": "Resumed a workout you already had in progress.",
  "workout.start": "Start Workout",
  "workout.target": "Target: {sets} x {reps}",
  "workout.suggested": "Suggested {weight}kg",
  "workout.addSet": "+ Add Set",
  "workout.completing": "Completing...",
  "workout.complete": "Complete Workout",
  "workout.skip": "Skip",
  "workout.restSeconds": "Rest {seconds}s",

  "history.noneYet": "No workout history yet. Start your first workout!",
  "history.title": "Workout History",
  "history.backToHistory": "Back to history",

  "session.notFound": "Session not found",
  "session.details": "Session Details",
  "session.duration": "Duration: {duration}",
  "session.noExercisesLogged": "No exercises logged",
  "session.exerciseNumber": "Exercise #{id}",
  "session.noSetsLogged": "No sets logged",
  "session.setLabel": "Set {position}",

  "exercise.history": "Exercise History",
  "exercise.noHistory": "No history for this exercise yet",
  "exercise.tableSet": "Set",
  "exercise.tableWeight": "Weight (kg)",
  "exercise.tableReps": "Reps",
  "exercise.lastTime": "Last time:",
  "exercise.lastTimeFailed": "Couldn't load your last time",
  "exercise.firstTime": "First time doing this",
  "exercise.hideDemo": "Hide demo",
  "exercise.showDemo": "Show demo",
  "exercise.demonstrationAlt": "{name} demonstration",
  "exercise.noAnimation": "No animation available",
  "exercise.animationUnavailable": "Animation unavailable",
  "exercise.loadingAnimation": "Loading animation…",

  "error.generic": "Something went wrong. Try again, or come back later.",
  "error.clientBoundary":
    "This page hit a problem. Try again, or use the menu above to go elsewhere.",

  "notFound.message": "This page doesn't exist.",
  "notFound.goBack": "Go back",

  "invite.invalidLink": "Invalid invitation link",
  "invite.googleFailed": "Google sign-in failed",
  "invite.acceptFailed": "Could not accept invitation",
  "invite.title": "Join Lactic",
  "invite.invitedByMiddle": " invited you to join as a client using ",
  "invite.unavailable": "This invitation is {status}. Ask your coach to send a new one.",
  "invite.status.expired": "expired",
  "invite.status.accepted": "accepted",
  "invite.status.revoked": "revoked",
  "invite.joining": "Joining…",
  "invite.accept": "Accept invitation",
  "invite.wrongAccount":
    "You are signed in as {currentEmail}. Continue with {invitedEmail} to accept this invitation.",
  "invite.continueWithGoogle":
    "Continue with Google to verify your email and finish joining.",
  "invite.verifying": "Verifying your account…",
  "invite.googleNotConfigured": "Google Sign-In is not configured.",
} as const;

export type MessageKey = keyof typeof en;
