"use client";

import { useState } from "react";
import { ChevronDown, Play, Lock, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  _id: string;
  title: string;
  duration: number;
  isFree: boolean;
}

interface Module {
  _id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface ModuleAccordionProps {
  modules: Module[];
  isEnrolled: boolean;
}

export function ModuleAccordion({ modules, isEnrolled }: ModuleAccordionProps) {
  const [openModules, setOpenModules] = useState<string[]>([modules[0]?._id]);

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <div className="border border-surface-200 rounded-xl overflow-hidden divide-y divide-surface-200">
      {modules.map((module, index) => {
        const isOpen = openModules.includes(module._id);
        const totalDuration = module.lessons?.reduce(
          (acc, l) => acc + (l.duration || 0),
          0
        ) || 0;

        return (
          <div key={module._id}>
            <button
              onClick={() => toggleModule(module._id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-surface-400 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
                <div>
                  <p className="font-medium text-surface-900">
                    Module {index + 1}: {module.title}
                  </p>
                  <p className="text-sm text-surface-500">
                    {module.lessons?.length || 0} lessons •{" "}
                    {totalDuration > 60
                      ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`
                      : `${totalDuration}m`}
                  </p>
                </div>
              </div>
            </button>

            {isOpen && module.lessons && module.lessons.length > 0 && (
              <div className="bg-surface-50 divide-y divide-surface-200">
                {module.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lesson._id}
                    className="flex items-center justify-between px-4 py-3 pl-12"
                  >
                    <div className="flex items-center gap-3">
                      {isEnrolled || lesson.isFree ? (
                        <Play className="w-4 h-4 text-primary-600" />
                      ) : (
                        <Lock className="w-4 h-4 text-surface-400" />
                      )}
                      <div>
                        <p className="text-sm text-surface-700">
                          {lessonIndex + 1}. {lesson.title}
                        </p>
                        {lesson.isFree && !isEnrolled && (
                          <span className="text-xs text-accent-600">
                            Free preview
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-surface-500">
                      <Clock className="w-3 h-3" />
                      {lesson.duration}m
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
