"use client";

import React, { useMemo } from "react";

interface LifeGridProps {
  birthdate: Date;
}

export default function LifeGrid({ birthdate }: LifeGridProps) {
  // Average life expectancy (in years)
  const LIFE_EXPECTANCY = 80;
  // Total weeks in expected lifetime
  const TOTAL_WEEKS = LIFE_EXPECTANCY * 52;

  const weeksData = useMemo(() => {
    const today = new Date();
    const birthTime = birthdate.getTime();
    const currentTime = today.getTime();

    // Calculate weeks lived
    const weeksLived = Math.floor(
      (currentTime - birthTime) / (7 * 24 * 60 * 60 * 1000)
    );

    // Calculate weeks left
    const weeksLeft = Math.max(0, TOTAL_WEEKS - weeksLived);

    return {
      weeksLived,
      weeksLeft,
      total: TOTAL_WEEKS,
    };
  }, [birthdate]);

  // Create grid with 52 columns (weeks per year)
  const grid = useMemo(() => {
    const rows = Math.ceil(TOTAL_WEEKS / 52);
    const result = [];

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < 52; j++) {
        const weekIndex = i * 52 + j;
        if (weekIndex < TOTAL_WEEKS) {
          const isLived = weekIndex < weeksData.weeksLived;
          row.push({ index: weekIndex, isLived });
        }
      }
      result.push(row);
    }

    return result;
  }, [weeksData]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-lg font-medium">Weeks lived: </span>
          <span className="text-lg">{weeksData.weeksLived}</span>
        </div>
        <div>
          <span className="text-lg font-medium">Weeks left: </span>
          <span className="text-lg">{weeksData.weeksLeft}</span>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 shadow-md">
        <div className="space-y-1">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex space-x-1">
              {row.map((week) => (
                <div
                  key={week.index}
                  className={`w-3 h-3 rounded-sm ${week.isLived ? "bg-emerald-600" : "bg-gray-700"}`}
                  title={`Week ${week.index + 1}`}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-400">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-emerald-600 rounded-sm mr-1"></div>
            <span>Weeks lived</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-700 rounded-sm mr-1"></div>
            <span>Weeks remaining</span>
          </div>
        </div>
      </div>
    </div>
  );
}
