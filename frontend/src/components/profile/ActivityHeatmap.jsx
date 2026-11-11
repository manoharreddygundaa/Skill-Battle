import React, { useMemo } from 'react';

export const ActivityHeatmap = ({ heatmapData = {} }) => {
  // Generate 52 weeks (365 days) ending today
  const { weeks, totalYearSubmissions } = useMemo(() => {
    const today = new Date();
    const days = [];
    let total = 0;

    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = heatmapData[dateStr]?.count || 0;
      total += count;

      days.push({
        date: dateStr,
        dayOfWeek: d.getDay(),
        count
      });
    }

    // Chunk into 52/53 columns of 7 days
    const cols = [];
    for (let i = 0; i < days.length; i += 7) {
      cols.push(days.slice(i, i + 7));
    }

    return { weeks: cols, totalYearSubmissions: total };
  }, [heatmapData]);

  const getColor = (count) => {
    if (!count || count === 0) return 'bg-[#181B28] hover:border-gray-600';
    if (count === 1) return 'bg-purple-950/70 text-purple-300 border border-purple-800/40';
    if (count === 2 || count === 3) return 'bg-purple-800 text-purple-200 border border-purple-600/50';
    if (count === 4 || count === 5) return 'bg-purple-600 text-white shadow-sm shadow-purple-900/40';
    return 'bg-purple-400 text-black font-bold shadow-md shadow-purple-500/30';
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="p-5 rounded-2xl bg-[#141622] border border-[#232738] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <span>Submission Activity</span>
            <span className="text-xs font-normal text-gray-400">
              ({totalYearSubmissions} submissions in the past year)
            </span>
          </h4>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-1.5 text-xs text-gray-400">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-[#181B28]" />
          <span className="w-2.5 h-2.5 rounded-sm bg-purple-950/80" />
          <span className="w-2.5 h-2.5 rounded-sm bg-purple-800" />
          <span className="w-2.5 h-2.5 rounded-sm bg-purple-600" />
          <span className="w-2.5 h-2.5 rounded-sm bg-purple-400" />
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col space-y-1 min-w-[680px]">
          {/* Day Rows (Sun=0 to Sat=6) */}
          {[1, 3, 5].map((dayRow) => (
            <div key={dayRow} className="flex items-center text-[10px] text-gray-400 mb-0.5">
              <span className="w-6">
                {dayRow === 1 ? 'Mon' : dayRow === 3 ? 'Wed' : 'Fri'}
              </span>
            </div>
          ))}

          {/* Grid Columns */}
          <div className="flex space-x-1">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col space-y-1">
                {week.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.count} submissions`}
                    className={`w-3 h-3 rounded-[3px] transition-all cursor-pointer ${getColor(
                      day.count
                    )}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

