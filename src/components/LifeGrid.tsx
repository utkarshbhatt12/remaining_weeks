'use client';

import type React from 'react';
import { useMemo, useState, useEffect } from 'react';

interface LifeGridProps {
  birthDate: Date;
  lifeExpectancy?: number;
}

const LifeGrid: React.FC<LifeGridProps> = ({
  birthDate,
  lifeExpectancy = 80,
}) => {
  // State to track available space - increased default size from 12 to 18
  const [boxSize, setBoxSize] = useState(18);
  const [columnsPerRow, setColumnsPerRow] = useState(10);

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
    const { weeksLived, currentYear } = calculateWeeks();
    const totalWeeks = lifeExpectancy * 52;
    const birthYear = birthDate.getFullYear();

    const grid = [];
    for (let year = 0; year < lifeExpectancy; year++) {
      const actualYear = birthYear + year;
      const isCurrentYear = actualYear === currentYear;

      const yearData = {
        year: year + 1,
        actualYear,
        isCurrentYear,
        quarters: [],
      } as {
        year: number;
        actualYear: number;
        isCurrentYear: boolean;
        quarters: { week: number; color: string; dateRange: string }[][];
      };

      // Create 4 quarters, each with 13 weeks
      for (let quarter = 0; quarter < 4; quarter++) {
        const quarterWeeks = [];
        for (let week = 0; week < 13; week++) {
          const currentWeek = year * 52 + quarter * 13 + week;

          // Use inline styles with CSS variables for more reliable coloring
          const bgColor =
            currentWeek < weeksLived
              ? 'var(--weekLived)'
              : 'var(--weekRemaining)';

          // Get date range for this week
          const dateRange = getWeekDateRange(currentWeek);

          quarterWeeks.push({
            week: currentWeek,
            color: bgColor,
            dateRange: dateRange,
          });
        }
        yearData.quarters.push(quarterWeeks);
      }

      grid.push(yearData);
    }

    return grid;
  };

  // Adjust layout based on screen size
  useEffect(() => {
    const handleResize = () => {
      // Determine optimal box size and columns based on screen size
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Calculate how many years we can fit horizontally and vertically
      // with some padding for other UI elements
      const availableHeight = height - 200; // Subtract space for header, stats, etc.
      const availableWidth = width - 80; // Increased padding from 40 to 80

      // Each year needs space for 4 rows of weeks plus padding and year label
      const yearHeight = 4 * boxSize + 40; // 4 rows + padding + label
      const yearWidth = 13 * boxSize + 30; // 13 columns + padding

      // Calculate how many years we can fit per row
      const yearsPerRow = Math.floor(availableWidth / yearWidth);

      // Calculate how many rows of years we can fit
      const maxYearRows = Math.floor(availableHeight / yearHeight);

      // Total years we can display
      const totalYearsVisible = yearsPerRow * maxYearRows;

      // If we can't fit all years, adjust the box size
      if (totalYearsVisible < lifeExpectancy) {
        // Calculate new box size to fit all years
        // Set minimum box size to 12 (increased from 8) to ensure dots are visible
        const newBoxSize = Math.max(
          12,
          Math.floor(
            Math.min(
              availableWidth / (13 * Math.ceil(lifeExpectancy / maxYearRows)),
              availableHeight / (4 * maxYearRows),
            ),
          ),
        );

        setBoxSize(newBoxSize);
      }

      // Set columns per row based on screen width
      if (width < 640) setColumnsPerRow(1);
      else if (width < 768) setColumnsPerRow(2);
      else if (width < 1024) setColumnsPerRow(3);
      else if (width < 1280) setColumnsPerRow(4);
      else if (width < 1536) setColumnsPerRow(5);
      else setColumnsPerRow(6);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [lifeExpectancy, boxSize]);

  const weeksGrid = useMemo(generateWeeksGrid, [birthDate, lifeExpectancy]);
  const { weeksLived, weeksRemaining, currentYear } = calculateWeeks();

  // Get the appropriate grid columns class based on columnsPerRow
  const getGridColumnsClass = () => {
    switch (columnsPerRow) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      case 5:
        return 'grid-cols-5';
      case 6:
        return 'grid-cols-6';
      default:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6';
    }
  };

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

        <div className={`grid ${getGridColumnsClass()} gap-3 p-2`}>
          {weeksGrid.map((yearData) => (
            <div
              key={yearData.year}
              className={`border rounded-lg p-3 flex flex-col items-center bg-card ${
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
              <div className="flex flex-col space-y-2">
                {yearData.quarters.map((quarter, quarterIndex) => (
                  <div key={quarterIndex} className="flex space-x-2">
                    {quarter.map((weekData) => (
                      <div
                        key={weekData.week}
                        style={{
                          width: `${boxSize}px`,
                          height: `${boxSize}px`,
                          backgroundColor: weekData.color,
                          borderRadius: '4px',
                          border: '1px solid var(--background)',
                        }}
                        title={`Week ${weekData.week + 1} (${
                          weekData.dateRange
                        })`}
                        data-week={weekData.week + 1}
                        data-date-range={weekData.dateRange}
                      />
                    ))}
                  </div>
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
