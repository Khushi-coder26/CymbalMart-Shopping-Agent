import React, { useState } from 'react';
import { PartyPlan, TimelineStep } from '../types';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
  Flame,
  Music,
  ShoppingBag,
} from 'lucide-react';

interface PrepTimelineTabProps {
  plan: PartyPlan;
}

export const PrepTimelineTab: React.FC<PrepTimelineTabProps> = ({ plan }) => {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (taskKey: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey],
    }));
  };

  const totalTasks = plan.timeline.reduce((sum, step) => sum + step.tasks.length, 0);
  const doneTasks = Object.values(completedTasks).filter(Boolean).length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                Party Prep & Run-of-Show Timeline
              </h3>
              <p className="text-xs text-slate-400">
                Stress-free step-by-step milestones to keep prep smooth from shopping trip to party kickoff.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 text-xs flex items-center gap-3">
            <div>
              <span className="text-slate-400">Tasks Completed:</span>{' '}
              <strong className="text-emerald-400 font-bold">
                {doneTasks} / {totalTasks}
              </strong>
            </div>
            <span className="text-slate-500">|</span>
            <span className="font-semibold text-slate-200">{progressPct}% Ready</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8">
        {plan.timeline.map((step, stepIdx) => (
          <div key={stepIdx} className="relative group">
            {/* Timeline node badge */}
            <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-slate-900 border-2 border-rose-500 flex items-center justify-center text-xs font-bold text-rose-300 shadow-md">
              {stepIdx + 1}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-400" />
                  <h4 className="font-bold text-sm text-slate-100">{step.timeframe}</h4>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {step.tasks.length} Action Items
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-2.5 pt-1">
                {step.tasks.map((task, taskIdx) => {
                  const taskKey = `${stepIdx}-${taskIdx}`;
                  const isDone = !!completedTasks[taskKey];

                  return (
                    <div
                      key={taskIdx}
                      onClick={() => toggleTask(taskKey)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                        isDone
                          ? 'bg-slate-800/20 text-slate-500'
                          : 'bg-slate-800/50 hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 flex-shrink-0 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                      <span
                        className={`text-xs leading-relaxed ${
                          isDone ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {task}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
