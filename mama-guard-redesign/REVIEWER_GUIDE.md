# Mama Guard - Reviewer Guide 🤰🛡️

Welcome to Mama Guard, an early-access maternal safety companion designed to provide non-diagnostic supportive guidance and symptom monitoring for mothers.

## 🌟 What is Mama Guard?
Mama Guard is a premium web application that helps mothers organize their symptoms, understand safe next steps, and prepare for productive conversations with their healthcare providers. It **does not replace medical advice or professional care**.

## 🚀 Key Features to Explore
1. **Dynamic Assistant**: Chat with the AI Assistant about common pregnancy concerns. It provides structured, non-diagnostic guidance.
2. **Safe Handoff**: From the Assistant, you can transition directly into a Check-in. Notice how the Assistant "suggests" a symptom, but the system **never auto-selects** it, ensuring the mother remains in control.
3. **Safety-informed check-in flow**: Test the Check-in flows with different inputs:
   - **Low Fever (<100.4°F)**: Triggers a "Review" state with monitoring steps.
   - **High Fever (100.4°F+)**: Triggers a "Needs Care" state with provider-prep guidance.
   - **Red Flags**: Symptoms like heavy bleeding or severe movement changes trigger immediate "Needs Care" prompts.
4. **Safety Plan**: Explore the "Safety" tab for instructions on what to do in different scenarios.
5. **Provider Summary**: View your check-in history in the "Home" dashboard, ready to show a clinician.

## 🛠️ How to Test in 5 Minutes
1. **Landing Page**: Start at the [Landing Page](https://guard-pink.vercel.app/) and experience the subtle 3D-lite motion design.
2. **AI Chat**: Go to the [Assistant tab](https://guard-pink.vercel.app/ai). Type "I feel a bit feverish."
3. **Safe Transition**: Click the "Start Check-in" button that appears in the AI's response.
4. **Manual Confirmation**: On the Check-in page, notice the "Assistant Handoff" banner. Confirm that the fever card is at the top but **not selected**.
5. **Complete Check-in**: Select the fever card, answer the follow-up (e.g., "Under 100.4°F"), and view the "Review" result.

## 📍 Essential Routes
- Dashboard: https://guard-pink.vercel.app/home
- Safety Check-in: https://guard-pink.vercel.app/checkin
- AI Assistant: https://guard-pink.vercel.app/ai
- Safety Plan: https://guard-pink.vercel.app/safety
- Educational Resources: https://guard-pink.vercel.app/learn
- About: https://guard-pink.vercel.app/about

## ⚠️ Safety Note
- **No Diagnosis**: This is a non-diagnostic companion.
- **Privacy**: This is a demo. Please **do not enter real private medical information**.
- **Not for Emergencies**: In a real emergency, always contact a healthcare provider or emergency services immediately.

## 💬 Feedback We Want
- Does the interface feel premium and maternal?
- Is the Assistant's guidance clear and supportive?
- Does the handoff from AI to Check-in feel safe and transparent?
- Are the risk result screens informative without being alarming?

Thank you for reviewing Mama Guard!
