"use strict"
module.exports = {
  options: {
    preset: {
      name: "conventional-changelog-conventionalcommits",
      types: [
        { type: "feat", section: "Features" },
        { type: "feature", section: "Features" },
        { type: "fix", section: "Bug Fixes" },
        { type: "perf", section: "Performance Improvements" },
        { type: "revert", section: "Reverts" },
        { type: "docs", section: "Documentation" },
        { type: "style", section: "Styles", hidden: true },
        {
          type: "chore",
          section: "Miscellaneous Chores",
          hidden: true
        },
        { type: "refactor", section: "Code Refactoring" },
        { type: "test", section: "Tests", hidden: true },
        { type: "build", section: "Build System", hidden: true },
        { type: "ci", section: "Continuous Integration", hidden: true }
      ]
    }
  }
}
