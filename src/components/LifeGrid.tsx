'use client';

import type React from 'react';
import { useMemo, useState } from 'react';

interface LifeGridProps {
  birthDate: Date;
  lifeExpectancy?: number;
}

const LifeGrid: React.FC<LifeGridProps> = ({
  birthDate,
  lifeExpectancy = 80,
}) => {
  // State to track available space - reduced default size from 18 to 12
  const [boxSize, setBoxSize] = useState(12);

  // Calculate weeks lived and remaining
  const calculateWeeks = () => {
    const today = new Date();
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;

    const weeksLived = Math.floor(
      (today.getTime() - birthDate.getTime()) / millisecondsPerWeek,
    );
    const weeksRemaining = Math.max(0, lifeExpectancy * 52 - weeksLived);

    return { weeksLived, weeksRemaining, currentYear: today.getFullYear() };
  };

  // Format date range for a specific week
  const getWeekDateRange = (weekIndex: number): string => {
    // Calculate the start date of this week (birthDate + weekIndex weeks)
    const weekStartDate = new Date(birthDate.getTime());
    weekStartDate.setDate(birthDate.getDate() + weekIndex * 7);

    // Calculate the end date (start date + 6 days)
    const weekEndDate = new Date(weekStartDate.getTime());
    weekEndDate.setDate(weekStartDate.getDate() + 6);

    // Format dates
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    return `${formatDate(weekStartDate)} - ${formatDate(weekEndDate)}`;
  };

  // Generate weeks grid
  const generateWeeksGrid = () => {
    const { weeksLived } = calculateWeeks();
    const totalWeeks = lifeExpectancy * 52;

    const grid = [];
    for (let year = 0; year < lifeExpectancy; year++) {
      const actualYear = birthDate.getFullYear() + year;
      const isCurrentYear = actualYear === new Date().getFullYear();

      const yearData = {
        year: year + 1,
        actualYear,
        isCurrentYear,
        weeks: [],
      } as {
        year: number;
        actualYear: number;
        isCurrentYear: boolean;
        weeks: { week: number; color: string; dateRange: string }[];
      };

      for (let week = 0; week < 52; week++) {
        const currentWeek = year * 52 + week;

        if (currentWeek >= totalWeeks) {
          yearData.weeks.push({
            week: currentWeek,
            color: 'transparent',
            dateRange: '',
          });
        } else {
          const bgColor =
            currentWeek < weeksLived
              ? 'var(--weekLived)'
              : 'var(--weekRemaining)';
          const dateRange = getWeekDateRange(currentWeek);

          yearData.weeks.push({
            week: currentWeek,
            color: bgColor,
            dateRange: dateRange,
          });
        }
      }

      grid.push(yearData);
    }

    return grid;
  };

  const weeksGrid = useMemo(generateWeeksGrid, [birthDate, lifeExpectancy]);
  const { weeksLived, weeksRemaining, currentYear } = calculateWeeks();

  return (
    <div className="w-full max-w-full mx-auto bg-card text-card-foreground rounded-lg shadow-lg px-6">
      <div className="space-y-2">
        <div className="flex justify-between px-4 py-2">
          <p className="text-sm">
            <span className="font-bold text-weekLived">{weeksLived}</span> weeks
            lived
          </p>
          <p className="text-sm">
            <span className="font-bold text-weekRemaining">
              {weeksRemaining}
            </span>{' '}
            weeks remaining
          </p>
          <p className="text-sm">
            <span className="font-bold text-currentYear">
              Current year: {currentYear}
            </span>
          </p>
        </div>

        {/* Use Tailwind's responsive grid classes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 p-2">
          {weeksGrid.map((yearData) => (
            <div
              key={yearData.year}
              className={`border rounded-lg p-3 flex flex-col items-center bg-card overflow-hidden ${
                yearData.isCurrentYear
                  ? 'border-currentYear ring-2 ring-currentYear/50'
                  : 'border-border'
              }`}
            >
              <div
                className={`text-sm font-semibold mb-3 ${
                  yearData.isCurrentYear
                    ? 'text-currentYear'
                    : 'text-muted-foreground'
                }`}
              >
                {yearData.actualYear}
              </div>
              {/* Correct grid layout */}
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: 'repeat(13, 1fr)', // 13 columns
                  gridTemplateRows: 'repeat(4, 1fr)', // 4 rows
                }}
              >
                {yearData.weeks.map((weekData) => (
                  <div
                    key={weekData.week}
                    style={{
                      width: `${boxSize}px`,
                      height: `${boxSize}px`,
                      backgroundColor: weekData.color,
                      borderRadius: '50%', // Make dots circular
                      border: '1px solid var(--background)',
                    }}
                    title={`Week ${weekData.week + 1} (${weekData.dateRange})`}
                    data-week={weekData.week + 1}
                    data-date-range={weekData.dateRange}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center px-2 pb-2">
          Each box represents one week of your life (based on {lifeExpectancy}
          -year expectancy)
        </div>
      </div>
    </div>
  );
};

export default LifeGrid;
