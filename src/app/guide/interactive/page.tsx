"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PlayCircle, CheckCircle, Calculator, FileText, ArrowRight } from "lucide-react";

export default function InteractiveGuidePage() {
  const [activeStep, setActiveStep] = useState(1);

  const STEPS = [
    {
      id: 1,
      title: "Step 1: Command Center & Setup",
      description: "Welcome to your central hub. Here, you can view your active estimates, recently saved calculators, and jump straight into work.",
      icon: <CheckCircle className="h-6 w-6 text-[--color-blue-brand]" />,
      videoPlaceholder: "guide-step-1-dashboard.png",
      videoUrl: "/videos/guide-dashboard.mp4"
    },
    {
      id: 2,
      title: "Step 2: Running a Trade Calculator",
      description: "Select an industry-specific calculator (like Concrete Slab). Input your exact measurements. The app provides exact yields and material lists.",
      icon: <Calculator className="h-6 w-6 text-[--color-blue-brand]" />,
      videoPlaceholder: "guide-step-2-concrete-result.png",
      videoUrl: "/videos/guide-calc.mp4"
    },
    {
      id: 3,
      title: "Step 3: Building Your Estimate",
      description: "Click 'Add to Estimate' to save your work. Combine multiple calculations (e.g., Concrete, Framing, Roofing) into a single proposal.",
      icon: <FileText className="h-6 w-6 text-[--color-blue-brand]" />,
      videoPlaceholder: "guide-step-3-added-to-cart.png",
      videoUrl: "/videos/guide-estimate.mp4"
    }
  ];

  return (
    <div className="light public-page page-shell bg-slate-50">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
          
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-black uppercase text-slate-900 tracking-tight">Platform Walkthrough</h1>
            <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">
              Follow this interactive guide to learn how to instantly calculate materials, build professional estimates, and speed up your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Nav Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              {STEPS.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all ${
                    activeStep === step.id 
                    ? "border-[--color-blue-brand] bg-white shadow-md ring-1 ring-[--color-blue-brand]" 
                    : "border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="pt-1">{step.icon}</div>
                    <div>
                      <h3 className={`font-bold text-lg ${activeStep === step.id ? "text-[--color-blue-brand]" : "text-slate-800"}`}>
                        {step.title}
                      </h3>
                      <p className="text-sm mt-1 text-slate-500 line-clamp-2">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white">
                <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <PlayCircle className="text-[--color-blue-brand]" /> Run the Auto-Guide
                </h4>
                <p className="text-sm text-slate-400 mb-4">
                  Did you know? Pro Construction Calc provides an automated Playwright script that will literally walk through the app in your browser to demonstrate the workflow!
                </p>
                <div className="bg-black/50 p-3 rounded-lg border border-slate-700 font-mono text-xs text-green-400 overflow-x-auto">
                  npx playwright test e2e/onboarding-guide-generator.spec.ts --ui
                </div>
              </div>
            </div>

            {/* Video/Visual Content Area */}
            <div className="lg:col-span-8">
              <div className="bg-white border flex flex-col items-center justify-center border-slate-200 rounded-2xl shadow-lg overflow-hidden h-full min-h-[500px] relative">
                
                <div className="absolute top-0 w-full bg-slate-100 border-b border-slate-200 p-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="mx-auto bg-white border border-slate-200 rounded text-[10px] font-mono px-4 py-1 text-slate-500">
                    proconstructioncalc.com
                  </div>
                </div>

                {/* Simulated Video Player */}
                <div className="w-full flex-1 flex flex-col items-center justify-center p-12 text-center mt-12">
                  <PlayCircle className="w-20 h-20 text-[--color-blue-brand] mb-6 opacity-80" />
                  <h2 className="text-2xl font-black text-slate-800 mb-2">
                    {STEPS.find(s => s.id === activeStep)?.title}
                  </h2>
                  <p className="text-slate-500 max-w-md mx-auto mb-8">
                    {STEPS.find(s => s.id === activeStep)?.description}
                  </p>
                  
                  <div className="inline-flex rounded-full bg-blue-50 text-blue-700 text-xs font-bold px-4 py-2 border border-blue-200 uppercase tracking-widest">
                    Interactive Video Demo
                  </div>
                  
                  <p className="mt-8 text-xs text-slate-400 max-w-sm">
                    (Note: This is an interactive staging area for the videos generated by the Playwright scripts you run locally.)
                  </p>
                </div>
                
                <div className="w-full p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                  <button 
                    disabled={activeStep === 1}
                    onClick={() => setActiveStep(prev => prev - 1)}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500"
                  >
                    Previous Step
                  </button>
                  <button 
                    disabled={activeStep === STEPS.length}
                    onClick={() => setActiveStep(prev => prev + 1)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[--color-blue-brand] px-5 py-2 text-sm font-black uppercase tracking-[0.08em] text-white shadow-sm transition hover:bg-[--color-blue-dark] disabled:opacity-50"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
