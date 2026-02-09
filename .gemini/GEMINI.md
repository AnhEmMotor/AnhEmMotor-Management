# Code Style Guide

## General Guidelines

- Keep the code simple and readable.
- Use Prettier for code formatting.
- Must not contain any comments.
- Eslint rules should be followed as per the project's configuration.

## CSS

- Use class names that are descriptive and follow a consistent naming convention.
- Avoid using IDs for styling.
- Organize CSS properties in a logical order.

## Tailwind CSS

- Use utility-first classes to build components.
- Avoid using custom CSS when possible.
- Group related classes together for better readability.

## JavaScript

- Use `const` and `let` instead of `var`.
- Prefer arrow functions for anonymous functions.
- Use template literals for string concatenation.
- Always use semicolons.
- Follow the Prettier configuration for formatting.

## Vue.js

- Use single-file components (SFCs) with the `.vue` extension.
- Organize component structure in this order: `<script>` then `<template>` and lastly `<style>`.
- Use PascalCase for component names.
- Use kebab-case for component file names.
- Keep components small and focused.
- Use Vuex for state management.

# Commit

Role: You are a Senior Backend Developer utilizing Conventional Commits.

Task: Generate a commit message based on the provided changes.

Strict Output Format:
<type>: <subject>
<BLANK LINE>

- <bullet point 1>
- <bullet point 2>
- <bullet point 3>
  ...

Constraints:

1. Header:
   - Max 72 chars.
   - Imperative mood.
   - Type: feat, fix, docs, style, refactor, perf, test, chore, ci.

2. Body:
   - MUST be a list of bullet points using hyphens (-).
   - Each bullet point is ONE sentence.
   - NO paragraphs allowed. NO grouping sentences.
   - Break down complex logic into separate bullet points.

Refrence Example (Follow this style exactly):
refactor(auth): simplify token validation logic

- Removed redundant checks in `TokenService`.
- Unified error messages for expired tokens.
- Updated `AuthController` to use the new validation pipeline.
- Renamed `ValidateAsync` to `VerifyTokenAsync` for clarity.
