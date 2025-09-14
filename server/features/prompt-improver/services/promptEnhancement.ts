/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// Enhanced system prompt for better prompt engineering results
export const PROMPT_ENHANCEMENT_SYSTEM = `You are a world-class prompt engineer who transforms vague requests into precise, actionable prompts for AI coding assistants like Windsurf, Claude, and GitHub Copilot.

# YOUR MISSION
Transform the user's prompt into a crystal-clear, comprehensive instruction that eliminates ambiguity and maximizes AI agent effectiveness.

# ENHANCEMENT FRAMEWORK

## 1. ROLE & CONTEXT
- Define the AI's specific role (e.g., "You are a senior React developer...")
- Establish the project context and technology stack
- Specify the current state and desired outcome

## 2. TASK STRUCTURE
- Break complex requests into numbered, sequential steps
- Use action verbs: "Create", "Implement", "Fix", "Optimize"
- Include specific deliverables for each step

## 3. TECHNICAL SPECIFICATIONS
- File paths and naming conventions
- Code structure and architecture patterns
- Dependencies and imports required
- Specific functions, classes, or components to create

## 4. SUCCESS CRITERIA
- Define "done" with measurable outcomes
- Include testing requirements
- Specify error handling expectations
- Add performance or quality benchmarks

## 5. CONSTRAINTS & REQUIREMENTS
- Technology versions and compatibility
- Coding standards and best practices
- Security considerations
- Accessibility requirements

# ENHANCEMENT RULES

✅ DO:
- Use imperative, direct language
- Include concrete examples
- Specify exact file locations
- Add validation steps
- Include edge cases
- Format with clear sections and headers

❌ DON'T:
- Use vague terms like "improve" or "enhance"
- Leave implementation details ambiguous
- Forget error handling
- Skip testing requirements

# OUTPUT FORMAT
Structure your enhanced prompt with these sections:

**ROLE & CONTEXT:**
[Define the AI's role and project context]

**OBJECTIVE:**
[Clear, specific goal statement]

**REQUIREMENTS:**
[Detailed technical specifications]

**IMPLEMENTATION STEPS:**
1. [Specific, actionable step]
2. [Next step with details]
...

**SUCCESS CRITERIA:**
[How to verify completion]

**ADDITIONAL CONSIDERATIONS:**
[Error handling, edge cases, testing]

Transform the user's prompt following this framework to create a professional-grade instruction that any AI coding assistant can execute flawlessly.`;

interface EnhancementOptions {
  format?: 'text' | 'markdown';
}

// Enhanced prompt template with better structure
export function createEnhancementPrompt(originalPrompt: string, options: EnhancementOptions = {}): string {
  const { format = 'text' } = options;
  
  const basePrompt = `${PROMPT_ENHANCEMENT_SYSTEM}

# ORIGINAL PROMPT
${originalPrompt}

# ENHANCED PROMPT`;

  if (format === 'markdown') {
    return `${basePrompt}

## Role & Context
[Define the AI's specific role and context]

## Task Structure
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Technical Specifications
- [Specification 1]
- [Specification 2]

## Success Criteria
- [Criterion 1]
- [Criterion 2]

## Constraints & Requirements
- [Constraint 1]
- [Constraint 2]`;
  }

  return `${basePrompt}
[Write your enhanced prompt here following the framework above. Be specific, technical, and include all necessary details.]`;
};

// Clean up the enhanced response
export const cleanEnhancedPrompt = (response: string): string => {
  let cleaned = response.trim();
  
  // Remove any markdown code block formatting if present
  cleaned = cleaned.replace(/^```[\w]*\n|\n```$/g, '');
  
  // Remove system prompt echoes or meta-commentary
  cleaned = cleaned.replace(/^[\s\S]*?(?=\*\*ROLE & CONTEXT|\*\*OBJECTIVE|# |## |\*\*)/, '');
  
  // Remove any leading "Enhanced Prompt:" headers that might be redundant
  cleaned = cleaned.replace(/^\*\*ENHANCED PROMPT:\*\*\s*\n\n?/i, '');
  cleaned = cleaned.replace(/^Enhanced Prompt:\s*\n\n?/i, '');
  cleaned = cleaned.replace(/^# YOUR ENHANCED PROMPT:\s*\n\n?/i, '');
  
  // Ensure proper formatting
  if (!cleaned.match(/^\*\*[A-Z& ]+:\*\*|^# /)) {
    cleaned = `# ENHANCED PROMPT\n\n${cleaned}`;
  }
  
  return cleaned.trim();
};

// Example usage and validation
export const validateEnhancedPrompt = (prompt: string): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check for key sections
  if (!prompt.includes('ROLE') && !prompt.includes('CONTEXT')) {
    issues.push('Missing role or context definition');
  }
  
  if (!prompt.includes('OBJECTIVE') && !prompt.includes('GOAL')) {
    issues.push('Missing clear objective statement');
  }
  
  if (!prompt.includes('STEP') && !prompt.includes('IMPLEMENTATION')) {
    issues.push('Missing implementation steps');
  }
  
  if (!prompt.includes('SUCCESS') && !prompt.includes('CRITERIA')) {
    issues.push('Missing success criteria');
  }
  
  // Check for specificity
  if (prompt.length < 200) {
    issues.push('Prompt may be too brief for complex tasks');
  }
  
  const vaguePhrases = ['improve', 'enhance', 'better', 'good', 'nice'];
  const hasVagueLanguage = vaguePhrases.some(phrase => 
    prompt.toLowerCase().includes(phrase)
  );
  
  if (hasVagueLanguage) {
    issues.push('Contains vague language that should be more specific');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};
