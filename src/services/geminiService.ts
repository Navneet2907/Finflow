/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { Transaction, FinancialInsight, CorporateStrategy, BehavioralAnalysis, Budget } from "../lib/types";
import { formatCurrency } from "../lib/utils";

// Standard prompt parts for context
const CORPORATE_CONTEXT = `You are a Senior Corporate Financial Growth Advisor. 
The user is a corporate professional earning roughly 1.2L per month.
Their goal is wealth optimization, tax efficiency (Section 80C, 80D, etc. in an Indian context), 
and smart deployment of surplus money after monthly expenses.`;

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Robust key retrieval for different environments (Node/Vite)
    const env = (import.meta as any).env;
    const apiKey = (typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : '') 
      || (env ? env.VITE_GEMINI_API_KEY : '')
      || "";
    
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateAIBriefing(transactions: Transaction[], insights: FinancialInsight[]): Promise<string> {
    try {
      const summary = transactions.slice(0, 20).map(t => `${t.merchant}: ${formatCurrency(t.amount)} (${t.category})`).join(', ');
      const insightSummary = insights.map(i => i.title).join(', ');

      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a concise (100-word) audio briefing script for this user. 
        Recent Transactions: ${summary}.
        Current Insights: ${insightSummary}.
        Focus on one major spending pattern and one high-impact wealth-building advice.`,
        config: {
          systemInstruction: CORPORATE_CONTEXT + " Keep the tone professional, authoritative, but encouraging. Use 'Neural Financial Engine' terminology occasionally.",
        }
      });

      return response.text || "Neural Briefing sync failed. Please check your data stream.";
    } catch (e) {
      console.error("AI Briefing Error:", e);
      return "Unable to initialize neural voice stream. Defaulting to local analysis.";
    }
  }

  async refineInsights(transactions: Transaction[]): Promise<FinancialInsight[]> {
    try {
      const summary = transactions.slice(0, 30).map(t => `${t.merchant}: ${formatCurrency(t.amount)} (${t.category})`).join(', ');
      
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Process this transaction ledger: ${summary}. 
        Identify patterns specific to corporate professionals (over-spending on dining, travel spikes, under-utilization of investments). 
        Format as JSON.`,
        config: {
          systemInstruction: CORPORATE_CONTEXT + ` Return a JSON list of 3 high-impact financial insights for this professional.
          Each insight must have the following structure:
          {
            "id": "string",
            "type": "spike" | "pattern" | "anomaly" | "suggestion" | "strategy",
            "title": "string",
            "description": "string",
            "severity": "low" | "medium" | "high",
            "actionLabel": "string"
          }`,
          responseMimeType: "application/json"
        }
      });

      const text = response.text || '[]';
      return JSON.parse(text);
    } catch (e) {
      console.error("AI Refinement Error:", e);
      return [];
    }
  }

  async analyzeSpendingHabits(transactions: Transaction[]): Promise<BehavioralAnalysis[]> {
    try {
      const summary = transactions.slice(0, 30).map(t => `${t.merchant}: ${formatCurrency(t.amount)} (${t.category})`).join(', ');
      
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Ledger: ${summary}. Analyze these transactions for behavioral spending habits. 
        Focus on psychological tendencies (e.g., Emotional Spending, Convenience Premium, Lifestyle Creep). 
        Format as JSON.`,
        config: {
          systemInstruction: CORPORATE_CONTEXT + ` Return a JSON list of 3 behavioral analyses.
          Structure:
          {
            "id": "string",
            "habitName": "string",
            "tendency": "Positive" | "Caution" | "Negative",
            "observation": "string",
            "realWorldImpact": "string",
            "improvementTip": "string"
          }
          The 'realWorldImpact' should explain how this habit affects their long-term wealth in the 'real world' (e.g., compound interest loss, future retirement delay).`,
          responseMimeType: "application/json"
        }
      });

      const text = response.text || '[]';
      return JSON.parse(text);
    } catch (e) {
      console.error("Habit Analysis Error:", e);
      return [];
    }
  }

  async suggestBudgets(transactions: Transaction[]): Promise<Budget[]> {
    try {
      const summary = transactions.slice(0, 50).map(t => `${t.merchant}: ${formatCurrency(t.amount)} (${t.category})`).join(', ');
      
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Process this transaction ledger: ${summary}. 
        Suggest a monthly budget for at least 5 main categories based on past spending patterns. 
        Format as JSON.`,
        config: {
          systemInstruction: CORPORATE_CONTEXT + ` Return a JSON list of 5-7 Budget objects.
          Structure:
          {
            "category": "string",
            "limit": number,
            "spent": number,
            "aiRecommendation": "string"
          }
          The 'spent' field should reflect the current month's spending in that category if detectable, or 0.
          The 'aiRecommendation' should concisely explain why this limit was chosen based on their professional goals.`,
          responseMimeType: "application/json"
        }
      });

      const text = response.text || '[]';
      return JSON.parse(text);
    } catch (e) {
      console.error("AI Budget Suggestion Error:", e);
      return [];
    }
  }
}

export const aiService = new GeminiService();
