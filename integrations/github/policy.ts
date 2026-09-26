export const githubEngineeringPolicy = {
  protectedBranches: ["main"],
  requirePassingTestsBeforeMerge: true,
  allowDirectMainPush: false,
  auditAllChanges: true
} as const;