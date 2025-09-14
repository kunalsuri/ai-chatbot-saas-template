# General + React + TypeScript Ruleset

- **Meta Rule**
  - Ensure full compliance with recent industry best practices
  - Focus on Feature-Driven Modular Architecture in React
  - Audit, refactor, and implement all necessary changes to fix existing errors and issues.
  - Be concise, precise; avoid generating speculative or context-less code (no hallucinations).
  - All code must prioritize readability and simplicity.
  - All code must be modular: create smaller, reusable components for maintainability
  - All code 
  - All rules apply exclusively to React + TypeScript (web) projects.

- **Code Style**
  - Components must be functional and use React hooks for state and lifecycle management; classes are disallowed.
  - No side effects or asynchronous logic directly inside render methods.
  - Code must be modular with no duplication.

- **Naming**
  - Directories use lowercase-dash style (e.g., `components/auth-wizard`).
  - Variables must be descriptive and use auxiliary verbs (`isLoading`, `hasError`).
  - Custom hooks must be prefixed with `use` (e.g., `useFetch`).
  - Use named exports primarily; default export reserved for main components only.

- **TypeScript**
  - Use TypeScript with strict mode enabled including strict null checks.
  - Prefer `interface` over `type` for object shapes to ensure clearer contracts.
  - Avoid `any`: allowed only with explicit comments justifying its use.
  - Avoid `enum` unless string enums are explicitly needed.
  - TypeScript strict mode must be enabled.  

- **Syntax**
  - Pure functions must use the function keyword.
  - Prefer arrow functions for callbacks unless explicit function keyword is required (e.g., for dynamic this).
  - Always use braces {} for conditionals and blocks, even if they contain a single statement, to improve readability and avoid errors.
  - JSX must be declarative.

- **Formatting**
  - Prettier formatting must be enforced.  

- **Styling**
  - Styling must use Tailwind CSS or styled-components.  
  - Layouts must be responsive using Flexbox, Grid, or container queries.  
  - Dark mode must be supported with CSS variables or `next-themes`.  
  - For Tailwind CSS, mention configuration files if relevant.
  - If using styled-components, mention naming conventions and avoiding inline styles.

- **Accessibility**
  - Semantic HTML must be used.  
  - ARIA roles must be applied where appropriate.
  - Test accessibility using tools like Lighthouse or axe.  
  - Verify keyboard navigation support and focus management.

- **Animations**
  - Animations must use Framer Motion or React Spring.
  - Minimize overuse of animations to avoid performance issues