import React, { useMemo } from "react";

interface LifeGridProps {
  birthDate: Date;
  lifeExpectancy?: number;
}

const LifeGrid: React.FC<LifeGridProps> = ({
  birthDate,
  lifeExpectancy = 80,
}) => {
  // Calculate weeks lived and remaining
  const calculateWeeks = () => {
    const today = new Date();
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;

    const weeksLived = Math.floor(
      (today.getTime() - birthDate.getTime()) / millisecondsPerWeek
    );
    const weeksRemaining = Math.max(0, lifeExpectancy * 52 - weeksLived);

    return { weeksLived, weeksRemaining };
  };

  // Generate weeks grid
  const generateWeeksGrid = () => {
    const { weeksLived, weeksRemaining } = calculateWeeks();
    const totalWeeks = lifeExpectancy * 52;

    const grid = [];
    for (let year = 0; year < lifeExpectancy; year++) {
      const yearData = {
        year: year + 1,
        quarters: [],
      } as {
        year: number;
        quarters: { week: number; color: string }[][];
      };

      // Create 4 quarters, each with 13 weeks
      for (let quarter = 0; quarter < 4; quarter++) {
        const quarterWeeks = [];
        for (let week = 0; week < 13; week++) {
          const currentWeek = year * 52 + quarter * 13 + week;

          // Determine color intensity based on weeks lived
          const percentageLived = (currentWeek / totalWeeks) * 100;
          let bgColor = "bg-gray-700";
          let liveColor = "bg-green-700";

          if (currentWeek < weeksLived) {
            // Lived weeks - green gradient
            const intensity =
              Math.floor(Math.min(percentageLived, 100) / 5) * 100;
            bgColor = `${liveColor}`;
          }

          quarterWeeks.push({
            week: currentWeek,
            color: bgColor,
          });
        }
        yearData.quarters.push(quarterWeeks);
      }

      grid.push(yearData);
    }

    return grid;
  };

  const weeksGrid = useMemo(generateWeeksGrid, [birthDate, lifeExpectancy]);
  const { weeksLived, weeksRemaining } = calculateWeeks();

  return (
    <div className="w-full max-w-7xl mx-auto p-4 bg-gray-900 text-gray-100 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-100">
          Life Weeks Visualization
        </h2>
      </div>
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-lg">
            <span className="font-bold text-green-400">{weeksLived}</span> weeks
            lived
          </p>
          <p className="text-lg">
            <span className="font-bold text-gray-400">{weeksRemaining}</span>{" "}
            weeks remaining
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {weeksGrid.map((yearData) => (
            <div
              key={yearData.year}
              className="border rounded-lg p-2 flex flex-col items-center bg-gray-800 border-gray-700"
            >
              <div className="text-sm font-semibold text-gray-300 mb-2">
                Year {yearData.year}
              </div>
              <div className="flex flex-col space-y-1">
                {yearData.quarters.map((quarter, quarterIndex) => (
                  <div key={quarterIndex} className="flex">
                    {quarter.map((weekData) => (
                      <div
                        key={weekData.week}
                        className={`w-3 h-3 ${weekData.color} border border-gray-900`}
                        title={`Week ${weekData.week}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-400 text-center px-4">
          Each box represents one week of your life (based on {lifeExpectancy}
          -year expectancy)
        </div>
      </div>
    </div>
  );
};

export default LifeGrid;
